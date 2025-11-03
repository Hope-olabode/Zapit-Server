import express from "express";
import {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  deleteSurvey,
  updateSurvey
} from "../controllers/surveyController.js";

const router = express.Router();

router.post("/", createSurvey);
router.get("/", getAllSurveys);
router.get("/:id", getSurveyById);
router.delete("/:id", deleteSurvey);
router.put("/:id", updateSurvey);

export default router;
