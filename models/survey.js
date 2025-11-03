import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  id: Number,
  text: String,
  answer: String,
});

const categorySchema = new mongoose.Schema({
  id: Number,
  title: String,
  score: Number,
  questions: [questionSchema],
  remark: String,
});

const surveySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    locationName: { type: String, required: true },
    date: { type: String, required: true },
    ccList: [{ type: String }],
    categories: [categorySchema],
    by: { type: String, required: true },
  },
  { timestamps: true }
);

const Survey = mongoose.model("Survey", surveySchema);
export default Survey;
