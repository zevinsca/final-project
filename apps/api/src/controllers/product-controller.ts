import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";

// export async function createProduct() {}

// GET ALL PRODUCT
export async function getAllProduct(_req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      include: {
        ProductCategory: { include: { Category: true } },
        User: true,
        imageContent: true,
        imagePreview: true,
        Store: true,
        ProductInventory: true,
      },
    });

    const finalResult = products.map((item) => {
      return {
        id: item.id,
        name: item.name,
        decription: item.description,
        price: item.price,
        stock: item.stock,
        imagePreview: item.imagePreview,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        category: item.ProductCategory.map(
          (el: { Category: { name: string } }) => el.Category.name
        ),
      };
    });

    res.status(200).json({ data: finalResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get all products data" });
  }
}

// export async function getProductById() {}
// GET PRODUCT BY ID
export async function getProductById(req: Request, res: Response) {
  try {
    const id = req.params.productId;
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        ProductCategory: { include: { Category: true } },
        User: true,
        imageContent: true,
        imagePreview: true,
        Store: true,
        ProductInventory: true,
      },
    });
    res.status(200).json({ data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get product by id" });
  }
}

// export async function updateProduct() {}

// export async function deleteProduct() {}

// src/controllers/product.controller.ts

// POST
export async function createProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name, storeId, description, price, weight, stock, categoryIds } =
      req.body;

    const user = req.user as CustomJwtPayload;
    const userId = user.id;
    // Validasi sederhana
    if (!name || !storeId || !description || !price || !weight || !stock) {
      res.status(400).json({ message: "Missing required fields" });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        storeId,
        userId,
        description,
        price,
        weight,
        stock,
        ProductCategory: {
          create: categoryIds?.map((categoryId: string) => ({
            categoryId,
          })),
        },
        // ProductImage: {
        //   create: imageUrls?.map((imageUrl: string) => ({
        //     Image: {
        //       create: { imageUrl },
        //     },
        //   })),
        // },
      },
      include: {
        ProductCategory: { include: { Category: true } },
        // ProductImage: { include: { Image: true } },
      },
    });

    res.status(201).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}
