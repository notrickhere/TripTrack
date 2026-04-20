import { ObjectId } from "mongodb";

import { getDatabase } from "../config/db.js";

function getTripsCollection() {
  return getDatabase().collection("trips");
}

function getActivitiesCollection() {
  return getDatabase().collection("activities");
}

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
}

function getUserId(request) {
  return request.user?._id?.toString() || "";
}

export async function listTrips(request, response) {
  const userId = getUserId(request);
  const query = userId
    ? { $or: [{ seeded: true }, { seeded: { $ne: true }, userId }] }
    : { seeded: true };

  const trips = await getTripsCollection()
    .find(query)
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

  if (
    !trip ||
    (!trip.seeded && (!request.user || trip.userId !== getUserId(request)))
  ) {
    return response.status(404).json({ message: "Trip not found." });
  }

  return response.json(trip);
}

export async function createTrip(request, response) {
  const {
    city = "",
    continent = "",
    country = "",
    destination,
    startDate,
    endDate,
    notes = "",
  } = request.body;

  if (
    !destination ||
    !continent ||
    !country ||
    !city ||
    !startDate ||
    !endDate
  ) {
    return response.status(400).json({
      message:
        "Destination, continent, country, city, startDate, and endDate are required.",
    });
  }

  if (endDate < startDate) {
    return response.status(400).json({
      message: "A trip cannot end before it starts.",
    });
  }

  const trip = {
    city,
    continent,
    country,
    destination,
    seeded: false,
    startDate,
    endDate,
    notes,
    userId: getUserId(request),
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
    city = "",
    continent = "",
    country = "",
    destination,
    startDate,
    endDate,
    notes = "",
  } = request.body;

  if (
    !destination ||
    !continent ||
    !country ||
    !city ||
    !startDate ||
    !endDate
  ) {
    return response.status(400).json({
      message:
        "Destination, continent, country, city, startDate, and endDate are required.",
    });
  }

  if (endDate < startDate) {
    return response.status(400).json({
      message: "A trip cannot end before it starts.",
    });
  }

  const update = {
    city,
    continent,
    country,
    destination,
    startDate,
    endDate,
    notes,
    updatedAt: new Date(),
  };

  const result = await getTripsCollection().findOneAndUpdate(
    { _id: tripId, seeded: { $ne: true }, userId: getUserId(request) },
    { $set: update },
    { returnDocument: "after" },
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

  const result = await getTripsCollection().deleteOne({
    _id: tripId,
    seeded: { $ne: true },
    userId: getUserId(request),
  });

  if (!result.deletedCount) {
    return response.status(404).json({ message: "Trip not found." });
  }

  await getActivitiesCollection().deleteMany({
    tripId: tripId.toString(),
    userId: getUserId(request),
  });

  return response.status(204).send();
}
