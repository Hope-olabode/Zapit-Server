// controllers/issueController.js
import Issue from "../models/issue.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import issue from "../models/issue.js";

export const createIssue = async (req, res) => {
  try {
    const {
      description,
      Caused_by,
      Responsibilityn,
      location,
      status,
      priority,
      dateTime,
    } = req.body;

   
    // ✅ Parse categories safely
    let categories = [];
    try {
      if (req.body.categories) {
        if (typeof req.body.categories === "string") {
          // Try JSON first
          const parsed = JSON.parse(req.body.categories);
          if (Array.isArray(parsed)) {
            categories = parsed;
          } else {
            // fallback: comma-separated string
            categories = req.body.categories
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
        } else if (Array.isArray(req.body.categories)) {
          categories = req.body.categories;
        }
      }
    } catch (err) {
      console.error("Error parsing categories:", err);
      return res.status(400).json({
        message: "Invalid categories format. Must be an array or JSON string.",
        error: err.message,
      });
    }

    // ✅ Handle files (optional)
    const files = req.files || [];
    const uploadedImages = [];

    for (const file of files) {
      try {
        if (!file.buffer) {
          console.warn("File missing buffer:", file.originalname);
          continue;
        }

        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: `issues/${location || "general"}`, // 🔹 uploads organized by location
          resource_type: "image",
        });

        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({
          message: `Failed to upload image: ${file.originalname}`,
          error: uploadErr.message,
        });
      }
    }

    // ✅ Create and save issue
    const issue = new Issue({
      description: description.trim(),
      Caused_by: Caused_by?.trim() || "",
      Responsibilityn: Responsibilityn?.trim() || "",
      location: location?.trim() || "",
      status: status || "Pending",
      priority: priority || "High",
      dateTime: dateTime || "",
      categories,
      images: uploadedImages,
    });

    await issue.save();

    return res.status(201).json({
      message: "Issue created successfully.",
      issue,
    });
  } catch (error) {
    console.error("Create issue error:", error);

    // ✅ Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed.",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    // ✅ Handle unexpected errors
    return res.status(500).json({
      message: "An unexpected server error occurred.",
      error: error.message,
    });
  }
};


// Fetch all Issues
export const getIssues = async (req, res) => {
  try {
    // ✅ Fetch all issues, sorted by most recent first
    const issues = await Issue.find().sort({ createdAt: -1 });

    // ✅ If no issues found, return empty array with a message
    if (!issues || issues.length === 0) {
      return res.status(200).json({
        message: "No issues found.",
        issues: [],
      });
    }

    // ✅ Success response
    return res.status(200).json({
      message: "Issues fetched successfully.",
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Fetch issues error:", error);
    return res.status(500).json({
      message: "Server error while fetching issues.",
      error: error.message,
    });
  }
};
