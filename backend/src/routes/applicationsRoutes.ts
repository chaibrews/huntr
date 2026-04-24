import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  getApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/applicationsController";
import { attachTag, detachTag } from "../controllers/tagsController";

const router = Router();

router.use(authenticate);
router.get("/", getApplications);
router.post("/", createApplication);
router.get("/:id", getApplicationById);
router.patch("/:id", updateApplication);
router.patch("/:id/status", updateApplicationStatus);
router.delete("/:id", deleteApplication);
router.post("/:id/tags/:tagId", attachTag);
router.delete("/:id/tags/:tagId", detachTag);

export default router;
