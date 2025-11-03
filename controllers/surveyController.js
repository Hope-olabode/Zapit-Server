import Survey from "../models/survey.js";

// ✅ Create a new survey
export const createSurvey = async (req, res) => {
  try {
    const survey = new Survey(req.body);
    await survey.save();
    res.status(201).json({ message: "Survey created successfully", survey });
  } catch (error) {
    console.error("Error creating survey:", error);
    res.status(500).json({ message: "Failed to create survey", error });
  }
};

// ✅ Fetch all surveys in the exact original structure
export const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({}, { __v: 0, createdAt: 0, updatedAt: 0 });

    // If you want to ensure it's a clean array of plain objects:
    const formatted = surveys.map((survey) => ({
       id: survey._id,
      title: survey.title,
      locationName: survey.locationName,
      date: survey.date,
      ccList: survey.ccList,
      categories: survey.categories.map((cat) => ({
        id: cat.id,
        title: cat.title,
        score: cat.score,
        questions: cat.questions.map((q) => ({
          id: q.id,
          text: q.text,
          answer: q.answer,
        })),
        remark: cat.remark,
      })),
      by: survey.by,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    res.status(500).json({ message: "Failed to fetch surveys", error });
  }
};

// ✅ Get single survey by ID (still available)
export const getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    const formatted = {
      title: survey.title,
      locationName: survey.locationName,
      date: survey.date,
      ccList: survey.ccList,
      categories: survey.categories.map((cat) => ({
        id: cat.id,
        title: cat.title,
        score: cat.score,
        questions: cat.questions.map((q) => ({
          id: q.id,
          text: q.text,
          answer: q.answer,
        })),
        remark: cat.remark,
      })),
      by: survey.by,
    };

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch survey", error });
  }
};

// ✅ Delete survey
export const deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);
    if (!survey) return res.status(404).json({ message: "Survey not found" });
    res.status(200).json({ message: "Survey deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete survey", error });
  }
};

export const updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the survey exists
    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Update fields from request body
    Object.assign(survey, req.body);
    await survey.save();

    res.status(200).json({ message: "Survey updated successfully", survey });
  } catch (error) {
    console.error("Error updating survey:", error);
    res.status(500).json({ message: "Failed to update survey", error });
  }
};
