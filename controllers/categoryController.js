import Category from "../models/categoryModel.js";

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, colour } = req.body; // ✅ include colour
    console.log("Creating category with name:", name, "and colour:", colour);

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    if (!colour || !colour.trim()) {
      return res.status(400).json({ message: "Category colour is required" });
    }

    // Check if category already exists
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // ✅ Now include colour when creating
    const category = await Category.create({
      name: name.trim(),
      colour: colour.trim(),
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Server error while creating category" });
  }
};



// Fetch all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // Sort alphabetically by name
    res.status(200).json(categories);
    console.log(categories)
  } catch (error) {
    console.error("Fetch categories error:", error);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
};
