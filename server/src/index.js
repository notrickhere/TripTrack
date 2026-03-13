import dotenv from "dotenv";

import app from "./app.js";
import { connectToDatabase } from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/triptrack";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "triptrack";

async function startServer() {
  try {
    await connectToDatabase(MONGODB_URI, MONGO_DB_NAME);

    app.listen(PORT, () => {
      console.log(`TripTrack API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
