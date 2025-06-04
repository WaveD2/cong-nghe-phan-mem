import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/dbConnection";
import productRouter from "./routers/productRouter";
import consumeMessage from "./utils/consumeMessage";
import { errorHandler } from "./middlewares/errMiddlware";
import cookieParser from "cookie-parser";
import { seedProduct } from "./script";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

config();
dbConnect();
consumeMessage();

const app = express();
const PORT = process.env.PORT || 7002;
const apiRoot = process.env.API_ROOT || "/api/product-service";
const DOMAIN = process.env.DOMAIN || "http://localhost:7002";

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Serve static files from the uploads directory
const uploadDir = path.join(process.cwd(), 'Uploads');
app.use('/uploads', express.static(uploadDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use(apiRoot, productRouter);

// Image upload endpoint
app.post(`${apiRoot}/upload`, upload.array('images', 5), (req : any, res: any) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const fileUrls = req.files.map((file: any) => ({
      filename: file.filename,
      url: `${DOMAIN}/uploads/${file.filename}`,
    }));

    res.status(200).json({
      message: 'Images uploaded successfully',
      files: fileUrls,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use(errorHandler);

// Seed products
(async () => {
  await seedProduct();
})();

// Global error handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});