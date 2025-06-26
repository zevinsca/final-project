import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma-client";
import { ZodError } from "zod";

// import { Resend } from "resend";
import fs from "fs/promises";
// import handlebars from "handlebars";

import { registerSchema } from "../validations/auth-validation.js";

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function register(req: Request, res: Response) {
  try {
    const { email, firstName, lastName, username, password, phoneNumber } =
      registerSchema.parse(req.body);

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        username,
        password: hashedPassword,
        phoneNumber,
      },
    });

    res.status(201).json({ message: "Registration success" });
  } catch (error) {
    console.error(error);

    if (error instanceof ZodError) {
      res.status(500).json({
        message: "From ZOD: Failed to register new user",
        error: error.flatten().fieldErrors,
      });
      return;
    }

    res.status(500).json({ message: "Failed to register new user", error });
  }
}

/* -------------------------------------------------------------------------- */
/*                         Login With Web Market Snap                         */
/* -------------------------------------------------------------------------- */
export async function login(req: Request, res: Response) {
  try {
    const { username, password, email } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username: username }, { email: email }] },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (!existingUser.password) {
      res.status(400).json({ message: "User has no password set" });
      return;
    }
    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isValidPassword) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const JWTToken = jwt.sign(
      {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        fullName: existingUser.firstName + existingUser.lastName,
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_SECRET as string
    );

    res
      .cookie("accessToken", JWTToken, { httpOnly: true })
      .status(200)
      .json({ message: "Login success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
}
export async function signOut(req: Request, res: Response) {
  try {
    res
      .clearCookie("accessToken")
      .status(200)
      .json({ message: "Logout success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to logout" });
  }
}

/* -------------------------------------------------------------------------- */
/*                                Login Google                                */
/* -------------------------------------------------------------------------- */
export async function loginSuccess(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  res.json({
    message: "Login with Google successful",
    user: req.user,
  });
}
export async function loginFailed(_req: Request, res: Response) {
  res.status(401).json({ message: "Login with Google failed" });
}

export async function logout(req: Request, res: Response) {
  try {
    res
      .clearCookie("accessToken")
      .status(200)
      .json({ message: "Logout success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to logout" });
    res.redirect("/");
  }
}
