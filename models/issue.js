// models/Issue.js
import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    Caused_by: { type: String },
    Responsibility: { type: String },
    location: { type: String },
    status: { type: String, default: "Pending" },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "High" },
    dateTime: { type: String }, // keep as formatted string per your frontend
    categories: [{ type: String }],
    images: [
      {
        url: String,
        public_id: String, // Cloudinary public id (optional)
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Issue", issueSchema);
