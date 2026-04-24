import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  getUserTags,
  createTag,
  deleteTag,
} from "../controllers/tagsController";

const router = Router();
router.use(authenticate);

router.get("/", getUserTags);
router.post("/", createTag);
router.delete("/:id", deleteTag);

export default router;
