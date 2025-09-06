const express = require("express");
const Weather = require("../models/Weather");
const { auth } = require('../middleware/authMiddleware');
const mongoose = require("mongoose");

const router = express.Router();

// ✅ Create weather record (user only)
router.post("/", auth, async (req, res) => {
  try {
    const { city, temperature, condition, date } = req.body;

    const weather = new Weather({
      city,
      temperature,
      condition,
      date,
      user: req.user.id, // ✅ req.user.id (from JWT payload)
    });

    await weather.save();
    res.status(201).json(weather);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all weather records (admin sees all, user sees own)
router.get("/", auth, async (req, res) => {
  try {
    let records;
    if (req.user.role === "admin") {
      records = await Weather.find().populate("user", "name email");
    } else {
      records = await Weather.find({ user: req.user.id });
    }
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get weather by ID
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const record = await Weather.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    if (record.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update weather record
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    let record = await Weather.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    if (record.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    record = await Weather.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete weather record
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const record = await Weather.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    if (record.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await record.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
