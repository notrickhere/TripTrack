import cors from "cors";
import express from "express";
import morgan from "morgan";

import activityRoutes from "./routes/activityRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";

const app = express();
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const configuredOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : defaultAllowedOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || configuredOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS."));
    },
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/activities", activityRoutes);

export default app;
