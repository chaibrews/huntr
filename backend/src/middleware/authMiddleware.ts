import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express's Request type to add userId field
// so TypeScript knows it exists when we read it in controllers.
export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // Get just the token part in "Bearer [token]"
  const token = req.headers.authorization?.split(" ")[1];

  // If there's no token at all, stop here and return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verify token is real and hasn't expired
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // Attach the userId to the request object so the controller
    // can access it without decoding the token again.
    req.userId = payload.userId;

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
