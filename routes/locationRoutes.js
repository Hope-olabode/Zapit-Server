import express from "express";
import { createLocation, getLocations } from "../controllers/locationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/locations
router.post("/", protect, createLocation);
router.get("/", protect, getLocations);

export default router;
