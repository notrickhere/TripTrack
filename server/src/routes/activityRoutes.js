import { Router } from "express";

import {
  createActivity,
  deleteActivity,
  listActivities,
  updateActivity,
} from "../controllers/activityController.js";
import {
  attachOptionalUser,
  requireAuth,
} from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", attachOptionalUser, listActivities);
router.post("/", requireAuth, createActivity);
router.put("/:id", requireAuth, updateActivity);
router.delete("/:id", requireAuth, deleteActivity);

export default router;
