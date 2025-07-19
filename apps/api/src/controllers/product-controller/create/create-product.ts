import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import { CustomJwtPayload } from "../../../types/express.js";

export async function createProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name, description, price, weight, stock, categoryIds, storeId } =
      req.body;

    const user = req.user as CustomJwtPayload;
    const userId = user.id;

    // Check if name is provided and not undefined
    if (!name || name === undefined) {
      res.status(400).json({ message: "Product name is required." });
      return;
    }

    // Check if product name already exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        name: name, // Ensure name is properly provided here
      },
    });

    if (existingProduct) {
      res.status(400).json({ message: "Product name must be unique." });
      return;
    }

    // Validate required fields
    if (
      !description ||
      !price ||
      !weight ||
      !stock ||
      !categoryIds ||
      categoryIds.length === 0 ||
      !storeId
    ) {
      res.status(400).json({
        message: "Missing required fields or no categories selected.",
      });
      return;
    }

    // Create the product in the database
    const newProduct = await prisma.product.create({
      data: {
        name,
        userId,
        description,
        price,
        weight,
        ProductCategory: {
          create: categoryIds.map((categoryId: string) => ({
            categoryId,
          })),
        },
      },
      include: {
        ProductCategory: {
          include: {
            Category: true,
          },
        },
      },
    });
    if (!newProduct) {
      res.status(500).json({ message: "Failed to create product." });
      return;
    }
    // Create the StoreProduct entry to link the product to the store
    const storeProduct = await prisma.storeProduct.create({
      data: {
        productId: newProduct.id,
        storeId: storeId,
        stock, // Link product to store
      },
    });
    if (!storeProduct) {
      res.status(500).json({ message: "Failed to link product to store." });
      return;
    }
    res.status(201).json({
      message: "Product created successfully and linked to the store",
      data: {
        product: newProduct,
        storeProduct: storeProduct,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}
