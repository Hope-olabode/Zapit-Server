import express from "express";
import { createCategory, getCategories } from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/locations
router.post("/", protect, createCategory);
router.get("/", protect, getCategories);

export default router;
