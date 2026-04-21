import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");

dotenv.config({ path: path.join(projectRoot, ".env") });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/triptrack";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "triptrack";

function parseArgs(argv) {
  return {
    reset: argv.includes("--reset"),
  };
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      const nextCharacter = line[index + 1];

      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (character === "," && !insideQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

async function readCsv(filePath) {
  const fileContents = await fs.readFile(filePath, "utf8");
  const lines = fileContents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    return headers.reduce((record, header, index) => {
      record[header] = values[index] || "";
      return record;
    }, {});
  });
}

function parseDateString(value) {
  const [month, day, year] = value.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function toTitleCase(value = "") {
  return value.replace(/\w\S*/g, (word) => {
    const normalizedWord = word.toLowerCase();
    return normalizedWord.charAt(0).toUpperCase() + normalizedWord.slice(1);
  });
}

function normalizeTrip(row) {
  const startDate = parseDateString(row.startDate);
  const endDate = parseDateString(row.endDate);
  const normalizedStartDate = startDate <= endDate ? startDate : endDate;
  const normalizedEndDate = startDate <= endDate ? endDate : startDate;
  const timestamp = new Date();

  return {
    city: row.city,
    country: row.country,
    countryCode: row.countryCode,
    createdAt: timestamp,
    destination: row.destination,
    endDate: formatDate(normalizedEndDate),
    note: row.note,
    notes: row.note,
    seeded: true,
    startDate: formatDate(normalizedStartDate),
    timezone: row.timezone,
    updatedAt: timestamp,
  };
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function createActivityDate(startDateString, endDateString) {
  const startDate = new Date(`${startDateString}T00:00:00.000Z`);
  const endDate = new Date(`${endDateString}T00:00:00.000Z`);
  const dayRange = Math.max(
    0,
    Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
  const offset = getRandomInt(dayRange + 1);
  const activityDate = new Date(startDate);
  activityDate.setUTCDate(activityDate.getUTCDate() + offset);
  return formatDate(activityDate);
}

function normalizeActivity(row, tripId, trip) {
  const timestamp = new Date();

  return {
    createdAt: timestamp,
    date: row.startDate || createActivityDate(trip.startDate, trip.endDate),
    description: row.activityDescription || "",
    name: toTitleCase(row.activityName),
    seeded: true,
    time: row.time || "",
    tripId: tripId.toString(),
    updatedAt: timestamp,
  };
}

async function seedDatabase() {
  const { reset } = parseArgs(process.argv.slice(2));
  const tripsCsvPath = path.join(projectRoot, "seeding_data", "seed_trips.csv");
  const activitiesCsvPath = path.join(
    projectRoot,
    "seeding_data",
    "seed_activities.csv",
  );

  const tripRows = await readCsv(tripsCsvPath);
  const activityRows = await readCsv(activitiesCsvPath);

  if (tripRows.length === 0) {
    throw new Error("Trip seed file is empty.");
  }

  if (activityRows.length === 0) {
    throw new Error("Activity seed file is empty.");
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  try {
    const database = client.db(MONGO_DB_NAME);
    const tripsCollection = database.collection("trips");
    const activitiesCollection = database.collection("activities");

    if (reset) {
      await tripsCollection.deleteMany({});
      await activitiesCollection.deleteMany({});
    }

    const trips = tripRows.map(normalizeTrip);
    const tripInsertResult = await tripsCollection.insertMany(trips);
    const insertedTripIds = Object.values(tripInsertResult.insertedIds);

    const insertedTrips = trips.map((trip, index) => ({
      ...trip,
      _id: insertedTripIds[index],
    }));

    const activities = activityRows.map((row) => {
      const trip = insertedTrips[getRandomInt(insertedTrips.length)];
      return normalizeActivity(row, trip._id, trip);
    });

    await activitiesCollection.insertMany(activities);

    console.log(
      `Seed complete: inserted ${insertedTrips.length} trips and ${activities.length} activities into ${MONGO_DB_NAME}.`,
    );
    console.log(`Database target: ${MONGODB_URI}`);
  } finally {
    await client.close();
  }
}

seedDatabase().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
