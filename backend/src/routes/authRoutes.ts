import { Router, type Request, type Response } from "express";
import { register, login, getUser } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getUser);

export default router;
