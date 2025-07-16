import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";
import bcrypt from "bcryptjs";
import handlebars from "handlebars";
import fs from "fs/promises";
import { Resend } from "resend";
import { Role } from "../../generated/prisma/index.js";
import jwt from "jsonwebtoken";

const resend = new Resend(process.env.RESEND_API_KEY);

/* -------------------------------------------------------------------------- */
/*                                GET ALL USER                                */
/* -------------------------------------------------------------------------- */
export async function getAllUser(_req: Request, res: Response) {
  try {
    const user = await prisma.user.findMany();
    res.status(200).json({ message: "Get All user success", data: user });
  } catch (error) {
    console.error("get All User Error:", error);
    res.status(500).json({ message: "Failed to get address" });
  }
}
/* -------------------------------------------------------------------------- */
/*                              GET CURRENT USER                              */
/* -------------------------------------------------------------------------- */
export async function getCurrentUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Login biasa (manual)
    const user = req.user as CustomJwtPayload;
    const userId = user.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    // Login Google

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      role: user.role,
      loginType: user.loginType,
      isVerified: user.isVerified,
    };
    res.status(200).json({ data: userData });
  } catch (error) {
    console.error("get User Error:", error);
    res.status(500).json({ message: "Failed to get User" });
  }
}
/* -------------------------------------------------------------------------- */
/*                           GET UPDATE CURRENT USER                          */
/* -------------------------------------------------------------------------- */
export async function updateCurrentUser(req: Request, res: Response) {
  try {
    // Access the authenticated user data from req.user
    const user = req.user as CustomJwtPayload;
    const userId = user.id;

    // Check if userId exists, meaning the user is authorized
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get the data from the request body that the user wants to update
    const { email, firstName, lastName, phoneNumber, role } = req.body;

    // Validate if the data is present in the request body
    if (!email && !firstName && !lastName && !phoneNumber) {
      return res.status(400).json({ message: "No data to update" });
    }

    // Proceed to update the user's details in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId }, // Find the user by userId
      data: {
        email, // Update email
        firstName, // Update first name
        lastName, // Update last name
        phoneNumber, // Update phone number
        role,
      },
    });

    // Return the updated user data
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user", error });
  }
}
/* -------------------------------------------------------------------------- */
/*                                 DELETE USER                                */
/* -------------------------------------------------------------------------- */
export async function deleteUser(req: Request, res: Response) {
  try {
    // Get the authenticated user from req.user (you'll probably have a middleware for authentication)
    const user = req.user as CustomJwtPayload;

    const userRole = user.role;

    // Check if the user is a super admin
    if (userRole !== "SUPER_ADMIN") {
      res
        .status(403)
        .json({ message: "Forbidden: Only super admins can delete users." });
      return;
    }

    // Get the user ID to delete from the request params
    const { id } = req.params;

    // Check if the user to delete exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Proceed to delete the user from the database
    await prisma.user.delete({
      where: { id },
    });

    // Send a success response
    res.status(200).json({ message: "User successfully deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user.", error });
  }
}

// CHANGE PASSWORD
export async function changePassword(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user as CustomJwtPayload;
    const userId = user.ud; // Diambil dari auth middleware

    if (!oldPassword || !newPassword) {
      res
        .status(400)
        .json({ message: "oldPassword and newPassword are required." });
      return;
    }

    const userChangePassword = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userChangePassword) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Old password is incorrect." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Failed to change password." });
  }
}

export async function getUsersByRole(req: Request, res: Response) {
  try {
    const roleParam = req.query.role as string;

    if (!roleParam) {
      res.status(400).json({ message: "Role query parameter is required." });
      return;
    }

    // Validasi role
    let prismaRole: Role;
    if (roleParam.toUpperCase() === "STORE_ADMIN") {
      prismaRole = Role.STORE_ADMIN;
    } else if (roleParam.toUpperCase() === "SUPER_ADMIN") {
      prismaRole = Role.SUPER_ADMIN;
    } else {
      res.status(400).json({ message: "Invalid role value." });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        role: prismaRole,
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    res.status(200).json({
      message: "Users fetched successfully.",
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users." });
  }
}

export async function sendVerificationEmail(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;

    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!foundUser) {
      res.status(404).json({ message: "User tidak ditemukan." });
      return;
    }

    if (foundUser.isVerified) {
      res.status(200).json({ message: "Akun sudah diverifikasi." });
      return;
    }

    const token = jwt.sign(
      { email: foundUser.email },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken: token,
      },
    });

    const templateSource = await fs.readFile(
      "src/templates/verify-email.hbs",
      "utf-8"
    );
    const compiledTemplate = handlebars.compile(templateSource);
    const htmlTemplate = compiledTemplate({
      customerName: foundUser.username,
      token,
      currentYear: new Date().getFullYear(),
    });

    const { error: resendError } = await resend.emails.send({
      from: "MarketSnap <cs@resend.dev>",
      to: [foundUser.email],
      subject: "Please Verify Your Email Address",
      html: htmlTemplate,
    });

    if (resendError) {
      res.status(400).json({
        message: "Email gagal dikirim. Silakan coba beberapa saat lagi.",
      });
      return;
    }

    res.status(200).json({
      message: "Link verifikasi telah dikirim ke email Anda.",
    });
  } catch (error) {
    console.error("Send Verification Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
}

export async function confirmVerificationToken(req: Request, res: Response) {
  const { token } = req.query;

  try {
    if (!token || typeof token !== "string") {
      res.status(400).json({ message: "Token tidak valid." });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan." });
      return;
    }

    if (user.isVerified) {
      res.status(200).json({ message: "Akun Anda sudah diverifikasi." });
      return;
    }

    await prisma.user.update({
      where: { email: decoded.email },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    res.status(200).json({ message: "Email berhasil diverifikasi." });
  } catch (error) {
    console.error("Verifikasi gagal:", error);
    res
      .status(400)
      .json({ message: "Token tidak valid atau sudah kedaluwarsa." });
  }
}
