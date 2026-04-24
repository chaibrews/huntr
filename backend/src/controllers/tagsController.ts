import { Response } from "express";
import { z } from "zod";
import { prisma } from "../libs/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

const TagBody = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
});

// GET /api/tags — all tags belonging to this user
export const getUserTags = async (req: AuthRequest, res: Response) => {
  const tags = await prisma.tag.findMany({
    where: { userId: req.userId },
    orderBy: { name: "asc" },
  });
  res.json(tags);
};

// POST /api/tags — create a new tag
export const createTag = async (req: AuthRequest, res: Response) => {
  const parsed = TagBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const tag = await prisma.tag.create({
    data: { ...parsed.data, userId: req.userId! },
  });
  res.status(201).json(tag);
};

// DELETE /api/tags/:id — delete a tag (also disconnects from all applications)
export const deleteTag = async (req: AuthRequest, res: Response) => {
  const tag = await prisma.tag.findFirst({
    where: { id: req.params.id as string, userId: req.userId },
  });
  if (!tag) {
    res.status(404).json({ error: "Tag not found" });
    return;
  }
  await prisma.tag.delete({ where: { id: req.params.id as string } });
  res.status(204).send();
};

// POST /api/applications/:id/tags/:tagId — attach existing tag to application
export const attachTag = async (req: AuthRequest, res: Response) => {
  // Verify application belongs to user
  const application = await prisma.application.findFirst({
    where: { id: req.params.id as string, userId: req.userId },
  });
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  // Verify tag belongs to user
  const tag = await prisma.tag.findFirst({
    where: { id: req.params.tagId as string, userId: req.userId },
  });
  if (!tag) {
    res.status(404).json({ error: "Tag not found" });
    return;
  }

  const updated = await prisma.application.update({
    where: { id: req.params.id as string },
    data: { tags: { connect: { id: req.params.tagId as string } } },
    include: {
      statusHistory: { orderBy: { changedAt: "asc" } },
      tags: true,
    },
  });
  res.json(updated);
};

// DELETE /api/applications/:id/tags/:tagId — detach tag from application
export const detachTag = async (req: AuthRequest, res: Response) => {
  const application = await prisma.application.findFirst({
    where: { id: req.params.id as string, userId: req.userId },
  });
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const updated = await prisma.application.update({
    where: { id: req.params.id as string },
    data: { tags: { disconnect: { id: req.params.tagId as string } } },
    include: {
      statusHistory: { orderBy: { changedAt: "asc" } },
      tags: true,
    },
  });
  res.json(updated);
};
