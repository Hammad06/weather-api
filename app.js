require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const weatherRoutes = require("./routes/weather");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/weather", weatherRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("Weather API with Auth is running"));

const PORT = process.env.PORT || 5000;

// ✅ Clean mongoose connect (no duplicate .then)
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
