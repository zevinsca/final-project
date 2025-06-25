import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma/index.js";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma-client";
import { CustomJwtPayload, GoogleJwtPayload } from "../types/express.js";

export async function getCurrentUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    // Login biasa (manual)
    if ("role" in req.user) {
      const user = req.user as CustomJwtPayload;
      res.status(200).json({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        loginType: "manual",
      });
      return;
    }

    // Login Google
    if ("provider" in req.user && req.user.provider === "google") {
      const user = req.user as GoogleJwtPayload;
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        loginType: "google",
      };
      res.status(200).json({ data: userData });

      return;
    }

    // Fallback
    res.status(400).json({ message: "Unknown user type" });
  } catch (error) {
    console.error("get Address Error:", error);
    res.status(500).json({ message: "Failed to get address" });
  }
}
