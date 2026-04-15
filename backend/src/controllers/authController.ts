import { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../libs/prisma";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";

// Zod schema — defines the shape we expect the request body to have.
// If the body doesn't match this, we reject it before touching the DB.
// z.email() checks it's a valid email format.
// z.string().min(8) ensures password is at least 8 characters.
const AuthBody = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// ── REGISTER ──────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  //
  const parsed = AuthBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  // Check if someone already registered with this email.
  // findUnique returns null if not found.

  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  // bcrypt.hash hashes the password with a "salt rounds" value of 12.
  const passwordHash = await bcrypt.hash(password, 12);

  // Create the user in the DB
  // select: { id, email } means Prisma only returns those fields —
  // passwordHash never leaves the backend.
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true },
  });

  // jwt.sign creates a signed token containing { userId: user.id }.
  // process.env.JWT_SECRET is the secret key — only our server knows it,
  // so only we can verify tokens later.
  // expiresIn: "7d" means the token is valid for 7 days.
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!, // ! tells TypeScript "trust me, this exists"
    { expiresIn: "7d" },
  );

  res.status(201).json({ token, user });
};

// ── LOGIN ─────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  const parsed = AuthBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  // Look up the user by email.
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // bcrypt.compare hashes the incoming password and compares it
  // to the stored hash. Returns true if they match.
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.json({ token, user: { id: user.id, email: user.email } });
};

// ── GET CURRENT USER ──────────────────────────────────
export const getUser = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true },
  });

  // This shouldn't happen if the token is valid, but just in case
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
};
