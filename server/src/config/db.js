import { MongoClient } from "mongodb";

let client;
let database;

export async function connectToDatabase(uri, dbName) {
  if (database) {
    return database;
  }

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);
  return database;
}

export function getDatabase() {
  if (!database) {
    throw new Error("Database connection has not been initialized.");
  }

  return database;
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
  }
}
