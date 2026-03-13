import { ObjectId } from "mongodb";

import { getDatabase } from "../config/db.js";

function getActivitiesCollection() {
  return getDatabase().collection("activities");
}

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
}

export async function listActivities(request, response) {
  const query = request.query.tripId ? { tripId: request.query.tripId } : {};

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

  const activity = {
    tripId,
    name,
    description,
    date,
    time,
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
    name,
    description,
    date,
    time,
    updatedAt: new Date(),
  };

  const result = await getActivitiesCollection().findOneAndUpdate(
    { _id: activityId },
    { $set: update },
    { returnDocument: "after" }
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
  });

  if (!result.deletedCount) {
    return response.status(404).json({ message: "Activity not found." });
  }

  return response.status(204).send();
}
