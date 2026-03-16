import { ObjectId } from "mongodb";

import { getDatabase } from "../config/db.js";

function getTripsCollection() {
  return getDatabase().collection("trips");
}

function getActivitiesCollection() {
  return getDatabase().collection("activities");
}

async function getLatestPlannerTripEndDate() {
  const latestTrip = await getTripsCollection().findOne(
    { seeded: { $ne: true } },
    {
      sort: { endDate: -1 },
    }
  );

  return latestTrip?.endDate || "";
}

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
}

export async function listTrips(request, response) {
  const trips = await getTripsCollection()
    .find({})
    .sort({ startDate: 1, createdAt: -1 })
    .toArray();

  response.json(trips);
}

export async function getTripById(request, response) {
  const tripId = parseObjectId(request.params.id);

  if (!tripId) {
    return response.status(400).json({ message: "Invalid trip id." });
  }

  const trip = await getTripsCollection().findOne({
    _id: tripId,
  });

  if (!trip) {
    return response.status(404).json({ message: "Trip not found." });
  }

  return response.json(trip);
}

export async function createTrip(request, response) {
  const {
    continent = "",
    country = "",
    destination,
    startDate,
    endDate,
    notes = "",
  } = request.body;

  if (!destination || !continent || !country || !startDate || !endDate) {
    return response.status(400).json({
      message: "Destination, continent, country, startDate, and endDate are required.",
    });
  }

  if (endDate < startDate) {
    return response.status(400).json({
      message: "A trip cannot end before it starts.",
    });
  }

  const latestPlannerEndDate = await getLatestPlannerTripEndDate();

  if (latestPlannerEndDate && startDate <= latestPlannerEndDate) {
    return response.status(400).json({
      message: `New trips must start after ${latestPlannerEndDate}.`,
    });
  }

  const trip = {
    continent,
    country,
    destination,
    startDate,
    endDate,
    notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await getTripsCollection().insertOne(trip);
  return response.status(201).json({ ...trip, _id: result.insertedId });
}

export async function updateTrip(request, response) {
  const tripId = parseObjectId(request.params.id);

  if (!tripId) {
    return response.status(400).json({ message: "Invalid trip id." });
  }

  const {
    continent = "",
    country = "",
    destination,
    startDate,
    endDate,
    notes = "",
  } = request.body;

  if (!destination || !continent || !country || !startDate || !endDate) {
    return response.status(400).json({
      message: "Destination, continent, country, startDate, and endDate are required.",
    });
  }

  if (endDate < startDate) {
    return response.status(400).json({
      message: "A trip cannot end before it starts.",
    });
  }

  const update = {
    continent,
    country,
    destination,
    startDate,
    endDate,
    notes,
    updatedAt: new Date(),
  };

  const result = await getTripsCollection().findOneAndUpdate(
    { _id: tripId },
    { $set: update },
    { returnDocument: "after" }
  );

  if (!result) {
    return response.status(404).json({ message: "Trip not found." });
  }

  return response.json(result);
}

export async function deleteTrip(request, response) {
  const tripId = parseObjectId(request.params.id);

  if (!tripId) {
    return response.status(400).json({ message: "Invalid trip id." });
  }

  const result = await getTripsCollection().deleteOne({ _id: tripId });

  if (!result.deletedCount) {
    return response.status(404).json({ message: "Trip not found." });
  }

  await getActivitiesCollection().deleteMany({ tripId: tripId.toString() });

  return response.status(204).send();
}
