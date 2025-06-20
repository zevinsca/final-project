import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma/index.js";
import fs from "fs/promises";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const body = req.body;
    const user = req.user;
    res.status(200).json({ data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed To Get User" });
  }
}
// export async function updateUserImage(req: Request, res: Response) {
//   try {
//     const userId = req.user;
//     const { firstName, lastName, email, username, password, phoneNumber } =
//       req.body;

//     const dataToUpdate: any = {
//       firstName,
//       lastName,
//       email,
//       username,
//       phoneNumber,
//     };

//     if (password && password.trim() !== "") {
//       const hashed = await bcrypt.hash(password, 10);
//       dataToUpdate.password = hashed;
//     }

//     // Update user data
//     await prisma.user.update({
//       where: { id: userId },
//       data: dataToUpdate,
//     });

//     // Upload image to Cloudinary if file exists

//     // Save image URL to UserImage

//     // Fetch updated user data + latest image
//     const updatedUser = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         email: true,
//         username: true,
//         phoneNumber: true,
//         role: true,
//       },
//     });

//     res.json({
//       message: "Profile updated successfully",
//       data: updatedUser,
//     });
//   } catch (error) {
//     console.error("Error updating user profile:", error);
//     res.status(500).json({ message: "Failed to update profile" });
//   }
// }

// export async function updateUserImage(req: Request, res: Response) {
//   try {
//     const body = req.body;
//     const file = req.file;

//     if (!req.file) {
//       res.status(400).json({ message: "Image not found" });
//       return;
//     }

//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: "Events-mini-project",
//     });

//     if (!result) {
//       res.status(400).json({ message: "Failed to upload image to Cloudinary" });
//       return;
//     }

//     await prisma.image.create({ data: { url: result.secure_url } });
//     await fs.unlink(req.file.path);

//     res.status(200).json({ data: { body: body, file: file } });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to upload single image" });
//   }
// }
