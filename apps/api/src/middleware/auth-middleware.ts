import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { string } from "zod";
import { CustomJwtPayload, GoogleJwtPayload } from "../types/express.js";
const CLIENT_ID = process.env.AUTH_GOOGLE_ID; // Pastikan Anda menyimpan CLIENT_ID di .env
const client = new OAuth2Client(CLIENT_ID);
/* ------------------------------------ 1 ----------------------------------- */
// 1. Check token ada atau tidak
// 2. Validasi token yang ada

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const accesstoken = req.cookies.accessToken;
  if (!accesstoken) {
    res.status(401).json({ message: "Unauthorized: Token not found" });
    return;
  }

  try {
    const payload = jwt.verify(accesstoken, process.env.JWT_SECRET!) as
      | CustomJwtPayload
      | GoogleJwtPayload;
    if (!payload) {
      res.status(401).json({ message: "Token verification failed" });
      return;
    }
    // Optional: kamu bisa validasi `provider` kalau mau
    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
}
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