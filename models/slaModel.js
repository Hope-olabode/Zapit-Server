import mongoose from "mongoose";

const slaSchema = new mongoose.Schema(
  {
    sla: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Sla", slaSchema);
