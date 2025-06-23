import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { string } from "zod";
import { CustomJwtPayload } from "../types/express.js";
const CLIENT_ID = process.env.AUTH_GOOGLE_ID; // Pastikan Anda menyimpan CLIENT_ID di .env
const client = new OAuth2Client(CLIENT_ID);
/* ------------------------------------ 1 ----------------------------------- */
// 1. Check token ada atau tidak
// 2. Validasi token yang ada

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    res.status(401).json({ message: "Token is required" });
    return;
  }

  try {
    const payload = jwt.verify(
      accessToken,
      process.env.JWT_SECRET || "superdupersecret"
    ) as CustomJwtPayload;
    if (!payload) {
      res.status(401).json({ message: "Token verification failed" });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token verification failed" });
  }
}
/* -------------------------------------------------------------------------- */
/*                             verify google token                            */
/* -------------------------------------------------------------------------- */

/* ------------------------------------ 2 ----------------------------------- */
export function roleGuard(...roles: string[]) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const user = req.user;

    if (user && isJwtUser(user) && roles.includes(user.role)) {
      return next();
    }

    return res.status(403).json({ message: "Unauthorized access" });
  };
}

function isJwtUser(user: any): user is { role: string } {
  return user && typeof user.role === "string";
}
