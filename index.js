import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import issuesRouter from "./routes/issueRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import slaRoutes from "./routes/slaRoutes.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://zapit-client.vercel.app",
  "http://localhost:5173"
];

// Middleware
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Force HTTPS on Render
app.use((req, res, next) => {
  if (req.headers["x-forwarded-proto"] !== "https" && process.env.NODE_ENV === "production") {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/issues", issuesRouter);
app.use("/api/surveys", surveyRoutes);
app.use("/api/sla", slaRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

app.get("/", (req, res) => {
  res.send("Server is running 🚀 and connected to MongoDB");
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});