import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 MongoDB Connection (cached)
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

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

const Mileage =
  mongoose.models.Mileage ||
  mongoose.model("Mileage", mileageSchema);

// ✅ Routes (NO /api prefix)

app.post("/save", async (req, res) => {
  await connectDB();
  const newEntry = new Mileage(req.body);
  await newEntry.save();
  res.json({ message: "Saved" });
});

app.get("/data", async (req, res) => {
  await connectDB();
  const data = await Mileage.find().sort({ date: 1 });
  res.json(data);
});

app.get("/last", async (req, res) => {
  await connectDB();
  const last = await Mileage.findOne().sort({ _id: -1 });
  res.json(last);
});

app.get("/average", async (req, res) => {
  await connectDB();

  const data = await Mileage.find();

  let totalDistance = 0;
  let totalFuel = 0;

  data.forEach(d => {
    totalDistance += d.distance;
    totalFuel += d.quantity;
  });

  res.json({
    averageMileage: totalFuel ? totalDistance / totalFuel : 0
  });
});

export default app;