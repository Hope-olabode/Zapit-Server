import express from "express";
import { createLocation, getLocations, updateLocation } from "../controllers/locationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/locations
router.post("/", protect, createLocation);
router.get("/", protect, getLocations);
router.put("/:id", protect, updateLocation);

export default router;
