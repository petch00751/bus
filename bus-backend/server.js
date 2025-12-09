// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ================== MONGO URI ==================
// 👉 แก้ตรงนี้ให้ใส่รหัสผ่านจริงของ user ใน MongoDB Atlas
const MONGO_URI = "mongodb+srv://thanakritthongphat:p240351@bus.1p9tv1q.mongodb.net/?appName=bus";

if (!MONGO_URI) {
  console.error('❌ ไม่มีค่า MONGO_URI');
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB error:', err);
  });

// ================ SCHEMA / MODEL ================
const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true, unique: true },
  checked: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
});

const Seat = mongoose.model('Seat', seatSchema, 'seats');

// ================ ROUTES =======================

// เช็คว่า API ยังทำงานอยู่ไหม
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Bus API is running' });
});

// ดึงทุกที่นั่ง
app.get('/api/seats', async (req, res) => {
  try {
    const seats = await Seat.find({});
    res.json(seats);
  } catch (err) {
    console.error('GET /api/seats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// เช็ค / ยกเลิกที่นั่ง
app.post('/api/seats/:seatNumber', async (req, res) => {
  try {
    const seatNumber = Number(req.params.seatNumber);
    const { checked } = req.body;

    if (checked === false) {
      await Seat.deleteOne({ seatNumber });
      return res.json({ seatNumber, deleted: true });
    }

    const seat = await Seat.findOneAndUpdate(
      { seatNumber },
      { checked: true, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json(seat);
  } catch (err) {
    console.error('POST /api/seats/:seatNumber error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ล้างทั้งหมด
app.post('/api/seats/clear', async (req, res) => {
  try {
    await Seat.deleteMany({});
    res.json({ message: 'cleared' });
  } catch (err) {
    console.error('POST /api/seats/clear error:', err);
    res.status(500).json({ message: 'error' });
  }
});

// ================ RUN SERVER ===================
const PORT = process.env.PORT || 3000; // Render จะใส่ PORT ให้เอง
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});