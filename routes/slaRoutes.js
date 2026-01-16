import express from "express";
import { upsertSla, getSla } from "../controllers/slaController.js";

const router = express.Router();

router.post("/", upsertSla);
router.get("/", getSla);

export default router;
