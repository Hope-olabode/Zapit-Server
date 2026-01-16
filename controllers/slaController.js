import Sla from "../models/slaModel.js";

export const upsertSla = async (req, res) => {
  try {
    const { sla } = req.body;

    if (typeof sla !== "number") {
      return res.status(400).json({ message: "Invalid SLA value" });
    }

    const updated = await Sla.findOneAndUpdate(
      {},
      { sla },
      { new: true, upsert: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSla = async (req, res) => {
  const sla = await Sla.findOne();
  res.json(sla);
};
