// routes/issues.js
import express from "express";
import multer from "multer";
import { createIssue, getIssues, updateIssueById, deleteIssueById } from "../controllers/issueController.js";
import { upload } from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// multer memory storage so we can upload buffer directly to Cloudinary
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file limit (adjust)
// });

// Accept up to e.g. 6 images
router.post("/", upload.array("images", 6), createIssue);
router.put("/:id", upload.array("images", 6), updateIssueById);
router.delete("/:id", deleteIssueById);
router.get("/", protect, getIssues);
export default router;
