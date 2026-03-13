import cors from "cors";
import express from "express";
import morgan from "morgan";

import activityRoutes from "./routes/activityRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/activities", activityRoutes);

export default app;
