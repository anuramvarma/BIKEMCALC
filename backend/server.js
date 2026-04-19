require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// 📄 Schema
const mileageSchema = new mongoose.Schema({
  date: String,
  prevOdo: Number,
  currOdo: Number,
  distance: Number,
  fuelPrice: Number,
  amount: Number,
  quantity: Number
});

const Mileage = mongoose.model("Mileage", mileageSchema);

// ✅ Save Data
app.post("/save", async (req, res) => {
  try {
    const newEntry = new Mileage(req.body);
    await newEntry.save();
    res.json({ message: "Saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📥 Get All Data
app.get("/data", async (req, res) => {
  const data = await Mileage.find().sort({ date: 1 });
  res.json(data);
});

// 🔁 Get Last Entry
app.get("/last", async (req, res) => {
  const last = await Mileage.findOne().sort({ _id: -1 });
  res.json(last);
});

// 📊 Get Average Mileage
app.get("/average", async (req, res) => {
  const data = await Mileage.find().sort({ date: 1 });

  let totalDistance = 0;
  let totalFuel = 0;

  for (let i = 0; i < data.length - 1; i++) {
    const curr = data[i];
    const next = data[i + 1];

    if (curr.quantity > 0) {
      const distance = next.currOdo - curr.currOdo;

      totalDistance += distance;
      totalFuel += curr.quantity;
    }
  }

  const avg = totalFuel > 0 ? totalDistance / totalFuel : 0;

  res.json({
    totalDistance,
    totalFuel,
    averageMileage: avg
  });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
