// backend/server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;
const mongoURL = process.env.MONGO_URL || 'mongodb://database:27017/mydb';

app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:*"
  ],
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Connexion MongoDB avec retry
const connectWithRetry = () => {
  mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error, retrying in 5s:", err.message);
    setTimeout(connectWithRetry, 5000); // réessaie toutes les 5 secondes
  });
};
connectWithRetry();

// Schéma / modèle simple
const MessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", MessageSchema);

// Routes
app.get("/api", (req, res) => {
  res.json({ message: "Hello from Backend!", success: true });
});

app.get("/api/messages", async (req, res) => {
  try {
    const msgs = await Message.find().sort({ createdAt: -1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, error: "text required" });
    const msg = new Message({ text });
    await msg.save();
    res.json({ success: true, msg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));

