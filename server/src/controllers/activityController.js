import { ObjectId } from "mongodb";

import { getDatabase } from "../config/db.js";

function getActivitiesCollection() {
  return getDatabase().collection("activities");
}

function getTripsCollection() {
  return getDatabase().collection("trips");
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

function toTitleCase(value = "") {
  return value.replace(/\w\S*/g, (word) => {
    const normalizedWord = word.toLowerCase();
    return normalizedWord.charAt(0).toUpperCase() + normalizedWord.slice(1);
  });
}

export async function listActivities(request, response) {
  if (!request.query.tripId) {
    return response.json([]);
  }

  const trip = await getTripsCollection()
    .findOne({
      _id: new ObjectId(request.query.tripId),
    })
    .catch(() => null);

  if (!trip) {
    return response.json([]);
  }

  if (!trip.seeded && (!request.user || trip.userId !== getUserId(request))) {
    return response
      .status(403)
      .json({ message: "You do not have access to that itinerary." });
  }

  const query = trip.seeded
    ? { seeded: true, tripId: request.query.tripId }
    : {
        seeded: { $ne: true },
        tripId: request.query.tripId,
        userId: getUserId(request),
      };

  const activities = await getActivitiesCollection()
    .find(query)
    .sort({ date: 1, time: 1, createdAt: -1 })
    .toArray();

  response.json(activities);
}

export async function createActivity(request, response) {
  const { tripId, name, description = "", date, time = "" } = request.body;

  if (!tripId || !name || !date) {
    return response.status(400).json({
      message: "tripId, name, and date are required.",
    });
  }

  const trip = await getTripsCollection()
    .findOne({
      _id: new ObjectId(tripId),
      seeded: { $ne: true },
      userId: getUserId(request),
    })
    .catch(() => null);

  if (!trip) {
    return response.status(404).json({ message: "Planner trip not found." });
  }

  const activity = {
    tripId,
    name: toTitleCase(name.trim()),
    description,
    date,
    seeded: false,
    time,
    userId: getUserId(request),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await getActivitiesCollection().insertOne(activity);
  return response.status(201).json({ ...activity, _id: result.insertedId });
}

export async function updateActivity(request, response) {
  const activityId = parseObjectId(request.params.id);

  if (!activityId) {
    return response.status(400).json({ message: "Invalid activity id." });
  }

  const { name, description = "", date, time = "" } = request.body;

  const update = {
    name: toTitleCase((name || "").trim()),
    description,
    date,
    time,
    updatedAt: new Date(),
  };

  const result = await getActivitiesCollection().findOneAndUpdate(
    { _id: activityId, seeded: { $ne: true }, userId: getUserId(request) },
    { $set: update },
    { returnDocument: "after" },
  );

  if (!result) {
    return response.status(404).json({ message: "Activity not found." });
  }

  return response.json(result);
}

export async function deleteActivity(request, response) {
  const activityId = parseObjectId(request.params.id);

  if (!activityId) {
    return response.status(400).json({ message: "Invalid activity id." });
  }

  const result = await getActivitiesCollection().deleteOne({
    _id: activityId,
    seeded: { $ne: true },
    userId: getUserId(request),
  });

  if (!result.deletedCount) {
    return response.status(404).json({ message: "Activity not found." });
  }

  return response.status(204).send();
}
