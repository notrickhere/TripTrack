import { Router } from "express";

import {
  createTrip,
  deleteTrip,
  getTripById,
  listTrips,
  updateTrip,
} from "../controllers/tripController.js";
import {
  attachOptionalUser,
  requireAuth,
} from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", attachOptionalUser, listTrips);
router.get("/:id", attachOptionalUser, getTripById);
router.post("/", requireAuth, createTrip);
router.put("/:id", requireAuth, updateTrip);
router.delete("/:id", requireAuth, deleteTrip);

export default router;
