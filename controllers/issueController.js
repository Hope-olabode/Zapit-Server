// controllers/issueController.js
import Issue from "../models/issue.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import issue from "../models/issue.js";

export const createIssue = async (req, res) => {
  try {
    const {
      description,
      Caused_by,
      Responsibility,
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
      Responsibility: Responsibility?.trim() || "",
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

export const updateIssueById = async (req, res) => {
  console.log("=== 🔍 DEBUG START ===");
  console.log("📥 req.files:", req.files);
  console.log("🔑 req.files keys:", req.files ? Object.keys(req.files) : 'NO FILES OBJECT');
  console.log("📦 req.body:", req.body);
  console.log("=== 🔍 DEBUG END ===");
  
  try {
    const { id } = req.params;

    // 1️⃣ Find existing issue
    const existingIssue = await Issue.findById(id);
    if (!existingIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const {
      description,
      Caused_by,
      Responsibility,
      location,
      status,
      priority,
      dateTime,
    } = req.body;

    // 2️⃣ Parse categories safely
    let categories = existingIssue.categories;
    try {
      if (req.body.categories) {
        if (typeof req.body.categories === "string") {
          categories = JSON.parse(req.body.categories);
        } else if (Array.isArray(req.body.categories)) {
          categories = req.body.categories;
        }
      }
    } catch (err) {
      return res.status(400).json({ message: "Invalid categories format" });
    }

    // 3️⃣ Handle existing + new images
    const imageLimit = 3;
    
    // 🔥 Handle both multer formats
    let files = [];
    if (req.files) {
      if (Array.isArray(req.files)) {
        // multer.array() sometimes returns array directly
        files = req.files;
      } else if (req.files.images) {
        // or as an object with field name
        files = req.files.images;
      }
    }
    
    console.log("🖼️ Files array:", files);
    console.log("🖼️ Files count:", files.length);
    console.log("🖼️ First file (if exists):", files[0]);

    // 🔹 Parse existingImages (keep only valid ones)
    let existingImages = [];
    try {
      if (req.body.existingImages) {
        const parsed = JSON.parse(req.body.existingImages);
        if (Array.isArray(parsed)) existingImages = parsed;
      }
    } catch (err) {
      console.warn("⚠️ Failed to parse existingImages:", err.message);
    }

    console.log("📷 Existing images to keep:", existingImages.length);

    // --- Upload new images to Cloudinary ---
    const uploadedImages = [];
    for (const file of files) {
      try {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: `issues/${location || "general"}`,
        });
        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
        console.log("✅ Uploaded new image:", result.public_id);
      } catch (uploadErr) {
        console.error("❌ Cloudinary upload failed:", uploadErr);
      }
    }

    console.log("📤 New images uploaded:", uploadedImages.length);

    // --- Determine which old images to delete ---
    const previousImages = existingIssue.images || [];
    const keptPublicIds = existingImages.map((img) => img.public_id);

    // Delete images that were in DB but not in kept list
    const toDelete = previousImages.filter(
      (img) => !keptPublicIds.includes(img.public_id)
    );

    for (const img of toDelete) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
        console.log(`🗑️ Deleted old image: ${img.public_id}`);
      } catch (err) {
        console.warn(`⚠️ Failed to delete ${img.public_id}:`, err.message);
      }
    }

    // --- Merge kept + new (max 3) ---
    const finalImages = [...existingImages, ...uploadedImages].slice(0, imageLimit);
    console.log("🎯 Final images count:", finalImages.length);

    // 4️⃣ Update issue fields
    existingIssue.description = description?.trim() || existingIssue.description;
    existingIssue.Caused_by = Caused_by?.trim() || existingIssue.Caused_by;
    existingIssue.Responsibility = Responsibility?.trim() || existingIssue.Responsibility;
    existingIssue.location = location?.trim() || existingIssue.location;
    existingIssue.status = status || existingIssue.status;
    existingIssue.priority = priority || existingIssue.priority;
    existingIssue.dateTime = dateTime || existingIssue.dateTime;
    existingIssue.categories = categories;
    existingIssue.images = finalImages;

    // 5️⃣ Save and return
    const updatedIssue = await existingIssue.save();

    return res.status(200).json({
      message: "✅ Issue updated successfully",
      issue: updatedIssue,
    });
  } catch (error) {
    console.error("❌ Update issue error:", error);
    return res.status(500).json({
      message: "Server error updating issue",
      error: error.message,
    });
  }
};


export const deleteIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find the issue by ID
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // 2️⃣ Delete associated images from Cloudinary
    if (issue.images && issue.images.length > 0) {
      for (const img of issue.images) {
        if (img.public_id) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
            console.log(`🗑️ Deleted Cloudinary image: ${img.public_id}`);
          } catch (err) {
            console.warn(`⚠️ Failed to delete image ${img.public_id}:`, err.message);
          }
        }
      }
    }

    // 3️⃣ Delete the issue from MongoDB
    await Issue.findByIdAndDelete(id);

    // 4️⃣ Send response
    return res.status(200).json({
      message: "🗑️ Issue deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("❌ Delete issue error:", error);
    return res.status(500).json({
      message: "Server error while deleting issue",
      error: error.message,
    });
  }
};