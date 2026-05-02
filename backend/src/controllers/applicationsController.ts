import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../libs/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

function flattenApplication(app: any) {
  const { company, ...rest } = app;
  return {
    ...rest,
    company: company.name,
    location: company.location ?? null,
  };
}

// Validation schema for creating/updating an application.
const ApplicationBody = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  status: z
    .enum(["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED", "ARCHIVED"])
    .optional(),
  workSetup: z.enum(["ONSITE", "HYBRID", "REMOTE"]).nullable().optional(),
  location: z.string().nullable().optional(),
  appliedAt: z.string().datetime().nullable().optional(),
  url: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
  jobDescription: z.string().nullable().optional(),
  // Tags sent from the form as inline objects
  tags: z
    .array(
      z.object({
        name: z.string().min(1),
        color: z.string(),
      }),
    )
    .optional(),
});

// Schema specifically for status updates
const StatusBody = z.object({
  status: z.enum([
    "SAVED",
    "APPLIED",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
    "ARCHIVED",
  ]),
});

// ── GET ALL ───────────────────────────────────────────
export const getApplications = async (req: AuthRequest, res: Response) => {
  const applications = await prisma.application.findMany({
    where: { userId: req.userId },
    include: {
      statusHistory: { orderBy: { changedAt: "asc" } },
      tags: true,
      company: {
        select: { name: true, location: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(applications.map(flattenApplication));
};

// ── CREATE ────────────────────────────────────────────
export const createApplication = async (req: AuthRequest, res: Response) => {
  const parsed = ApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { tags: tagInputs, ...appData } = parsed.data;

  let company = await prisma.company.findFirst({
    where: { name: appData.company },
  });

  if (company) {
    if (appData.location !== company.location) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: { location: appData.location },
      });
    }
  } else {
    company = await prisma.company.create({
      data: { name: appData.company, location: appData.location },
    });
  }

  const { company: companyName, location, ...appFields } = appData;

  const application = await prisma.application.create({
    data: {
      ...appFields,
      userId: req.userId!,
      companyId: company.id,
      tags:
        tagInputs && tagInputs.length > 0
          ? {
              create: tagInputs.map((t) => ({
                name: t.name,
                color: t.color,
                userId: req.userId!,
              })),
            }
          : undefined,
    },
    include: {
      statusHistory: true,
      tags: true,
      company: { select: { name: true, location: true } },
    },
  });

  res.status(201).json(flattenApplication(application));
};

// ── GET ONE ───────────────────────────────────────────
export const getApplicationById = async (req: AuthRequest, res: Response) => {
  const application = await prisma.application.findFirst({
    where: { id: String(req.params.id), userId: req.userId },
    include: {
      statusHistory: { orderBy: { changedAt: "asc" } },
      tags: true,
      company: {
        select: { name: true, location: true },
      },
    },
  });

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(flattenApplication(application));
};

// ── UPDATE FIELDS ─────────────────────────────────────
export const updateApplication = async (req: AuthRequest, res: Response) => {
  const parsed = ApplicationBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  // Verify ownership before updating
  const existing = await prisma.application.findFirst({
    where: { id: String(req.params.id), userId: req.userId },
    include: { company: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const {
    tags: tagInputs,
    company: companyName,
    location,
    ...appFields
  } = parsed.data;

  // If company name or location changed, update the Company record
  if (companyName !== undefined || location !== undefined) {
    await prisma.company.update({
      where: { id: existing.companyId },
      data: {
        ...(companyName !== undefined && { name: companyName }),
        ...(location !== undefined && { location }),
      },
    });
  }

  const application = await prisma.application.update({
    where: { id: String(req.params.id) },
    data: {
      ...appFields, // ← clean now: no company string, no location
      ...(tagInputs
        ? {
            tags: {
              deleteMany: {},
              create: tagInputs.map((t) => ({
                name: t.name,
                color: t.color,
                userId: req.userId!,
              })),
            },
          }
        : undefined),
    },
    include: {
      statusHistory: { orderBy: { changedAt: "asc" } },
      tags: true,
      company: { select: { name: true, location: true } },
    },
  });

  res.json(flattenApplication(application));
};

// ── UPDATE STATUS ─────────────────────────────────────
export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = StatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.application.findFirst({
    where: { id: String(req.params.id), userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  // $transaction runs multiple DB operations atomically.
  // If either operation fails, both are rolled back —
  // you'll never end up with a status update without a history record,
  // or a history record for a status that didn't actually change.
  const [application] = await prisma.$transaction([
    prisma.application.update({
      where: { id: String(req.params.id) },
      data: { status: parsed.data.status },
      include: {
        statusHistory: { orderBy: { changedAt: "asc" } },
        tags: true,
        company: { select: { name: true, location: true } },
      },
    }),
    prisma.statusHistory.create({
      data: {
        applicationId: String(req.params.id),
        from: existing.status, // the current status before changing
        to: parsed.data.status, // the new status
      },
    }),
  ]);

  res.json(flattenApplication(application));
};

// ── DELETE ─────────────────────────────────────────────
export const deleteApplication = async (req: AuthRequest, res: Response) => {
  const existing = await prisma.application.findFirst({
    where: { id: String(req.params.id), userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  // StatusHistory rows are deleted automatically because of
  // onDelete: Cascade in the Prisma schema — no need to delete
  // them manually first.
  await prisma.application.delete({ where: { id: String(req.params.id) } });

  // 204 No Content — success, but nothing to return
  res.status(204).send();
};
