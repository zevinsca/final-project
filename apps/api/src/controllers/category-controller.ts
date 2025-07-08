import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({ message: "Name and description are required." });
      return;
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
      },
    });
    if (!newCategory) {
      res.status(500).json({ message: "Error creating category." });
      return;
    }
    res.status(201).json({
      message: "Category created successfully.",
      data: newCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getAllCategories(_req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany();
    if (!categories || categories.length === 0) {
      res.status(404).json({ message: "No categories found." });
      return;
    }
    res.status(200).json({
      message: "Categories fetched successfully.",
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch categories." });
  }
}

export async function getCategoryById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      res.status(404).json({ message: "Category not found." });
      return;
    }

    res.status(200).json({
      message: "Category fetched successfully.",
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch category." });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({ message: "Name and description are required." });
      return;
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, description },
    });

    res.status(200).json({
      message: "Category updated successfully.",
      data: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update category." });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const deletedCategory = await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Category deleted successfully.",
      data: deletedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete category." });
  }
}
