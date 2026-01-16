import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js"
import issuesRouter from "./routes/issueRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import slaRoutes from "./routes/slaRoutes.js";


connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ credentials: true, origin: "https://zapit-client.vercel.app",  /* "http://localhost:5173" */ })); // allow cookies from frontend
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/categories", categoryRoutes)
app.use("/api/issues", issuesRouter);
app.use("/api/surveys", surveyRoutes);
app.use("/api/sla", slaRoutes);


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

app.get("/", (req, res) => {
  res.send("Server is running 🚀 and connected to MongoDB");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
