// export async function createProduct() {}

// export async function getAllProduct() {}

// export async function getProductById() {}

// export async function updateProduct() {}

// export async function deleteProduct() {}

// src/controllers/product.controller.ts

import { Request, Response } from "express";
import prisma from "../config/prisma-client";

// GET ALL PRODUCT
export async function getAllProduct(req: Request, res: Response) {
  try {
    const search = req.query.search as string | undefined;

    const products = await prisma.product.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : undefined,
      include: {
        ProductImage: {
          include: { Image: true },
        },
        ProductCategory: {
          include: { Category: true },
        },
        Store: true,
        ProductInventory: true,
      },
    });

    return res.status(200).json({
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

//  GET /products/:id
export async function getProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        ProductImage: { include: { Image: true } },
        ProductCategory: { include: { Category: true } },
        Store: true,
        ProductInventory: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product detail fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// POST
export async function createProduct(req: Request, res: Response) {
  try {
    const {
      name,
      storeId,
      description,
      price,
      weight,
      stock,
      categoryIds,
      imageUrls,
    } = req.body;

    // Validasi sederhana
    if (!name || !storeId || !description || !price || !weight || !stock) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        storeId,
        description,
        price,
        weight,
        stock,
        ProductCategory: {
          create: categoryIds?.map((categoryId: string) => ({
            categoryId,
          })),
        },
        ProductImage: {
          create: imageUrls?.map((imageUrl: string) => ({
            Image: {
              create: { imageUrl },
            },
          })),
        },
      },
      include: {
        ProductCategory: { include: { Category: true } },
        ProductImage: { include: { Image: true } },
      },
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
