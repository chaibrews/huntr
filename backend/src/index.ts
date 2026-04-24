import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import Routes
import authRoutes from "./routes/authRoutes";
import applicationsRoutes from "./routes/applicationsRoutes";
import tagsRoutes from "./routes/tagsRoutes";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/tags", tagsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`huntR. backend running on port: ${PORT}`);
});
