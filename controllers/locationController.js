import Location from "../models/locationModel.js";

// Create a new location
export const createLocation = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Location name is required" });
    }

    // Check if location already exists
    const existing = await Location.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Location already exists" });
    }

    const location = await Location.create({ name: name.trim() });

    res.status(201).json({
      message: "Location created successfully",
      location,
    });
  } catch (error) {
    console.error("Create location error:", error);
    res.status(500).json({ message: "Server error while creating location" });
  }
};


// Fetch all locations
export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 }); // Sort alphabetically by name
    res.status(200).json(locations);
  } catch (error) {
    console.error("Fetch locations error:", error);
    res.status(500).json({ message: "Server error while fetching locations" });
  }
};

// Update a location by ID
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Location name is required" });
    }

    // Check if location exists
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Check if new name already exists (excluding current location)
    const existing = await Location.findOne({ 
      name: name.trim(),
      _id: { $ne: id }
    });
    if (existing) {
      return res.status(400).json({ message: "Location name already exists" });
    }

    // Update the location
    location.name = name.trim();
    await location.save();

    res.status(200).json({
      message: "Location updated successfully",
      location,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ message: "Server error while updating location" });
  }
};
