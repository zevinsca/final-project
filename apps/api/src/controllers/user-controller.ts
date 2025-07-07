import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";

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
      loginType: user.provider,
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
