import MongoStore from "connect-mongo";
import express from "express";
import session from "express-session";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import passport from "./config/passport.js";
import activityRoutes from "./routes/activityRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret =
  process.env.SESSION_SECRET || "development-session-secret";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "..", "..", "client", "dist");

app.use(morgan("dev"));
app.use(express.json());
app.set("trust proxy", 1);
app.use(
  session({
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    },
    name: "triptrack.sid",
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: sessionSecret,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGODB_URI || "mongodb://localhost:27017/triptrack",
      ttl: 60 * 60 * 24 * 7,
    }),
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/activities", activityRoutes);

if (isProduction) {
  app.use(express.static(clientDistPath));

  app.get("*", (request, response, next) => {
    if (request.path.startsWith("/api/")) {
      next();
      return;
    }

    response.sendFile(path.join(clientDistPath, "index.html"));
  });
}

export default app;
