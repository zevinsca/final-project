import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import { CustomJwtPayload } from "../../../types/express.js";

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
