
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://lets-read-web.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean),
];

// CORS ต้องอยู่ก่อน Routes
app.use(
  cors({
    origin(origin, callback) {
      // อนุญาตคำขอจากเครื่องมือทดสอบ API ที่ไม่มี Origin
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("[CORS] Blocked origin:", origin);
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Let's Read Backend is running",
  });
});

// จัดการ Error ที่เกิดใน Middleware หรือ Routes
app.use((error, req, res, next) => {
  console.error("[SERVER] Unhandled error:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).json({
    success: false,
    message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Let's Read Backend is running on port ${PORT}`);
  console.log("[CORS] Allowed origins:", allowedOrigins);
});
