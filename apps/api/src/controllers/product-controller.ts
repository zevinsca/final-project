import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";
import cloudinary from "../config/cloudinary-config.js";
import fs from "fs/promises";

// GET ALL PRODUCT
export async function getAllProduct(req: Request, res: Response) {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (category) {
      where.ProductCategory = {
        some: {
          Category: {
            name: {
              equals: category,
              mode: "insensitive",
            },
          },
        },
      };
    }

    // ✅ Query prisma
    const products = await prisma.product.findMany({
      where,
      include: {
        ProductCategory: { include: { Category: true } },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: {
          include: {
            Store: true,
          },
        },
      },
    });

    // ✅ Mapping
    const finalResult = products.map((item) => {
      const storeProduct = item.StoreProduct?.[0];

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        stock: storeProduct ? storeProduct.stock : 0,
        storeName: storeProduct?.Store?.name ?? null,
        imagePreview: item.imagePreview,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        category: item.ProductCategory.map((el) => el.Category.name),
      };
    });

    res.status(200).json({ data: finalResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get all products data" });
  }
}

// GET PRODUCT BY ID
export async function getProductById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    console.log("Mencari produk dengan ID:", id);

    const product = await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null, // hanya ambil yang belum dihapus
      },
      include: {
        ProductCategory: {
          include: {
            Category: true,
          },
        },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: {
          include: {
            Store: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ message: "Produk tidak ditemukan." });
      return;
    }

    res.status(200).json({ data: product });
  } catch (error) {
    console.error("Gagal mengambil produk berdasarkan ID:", error);
    res.status(500).json({ message: "Gagal mengambil produk berdasarkan ID." });
  }
}

// CREATE PRODUCT
export async function createProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name, description, price, weight, storeStocks } = req.body;

    const user = req.user as CustomJwtPayload;
    // Ambil dari req.body
    let { categoryIds } = req.body;

    // Ubah ke array
    if (typeof categoryIds === "string") {
      categoryIds = [categoryIds];
    }

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (
      !name ||
      !description ||
      !price ||
      !weight ||
      !categoryIds ||
      !storeStocks
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const parsedStoreStocks = JSON.parse(storeStocks);

    // Create the Product first
    const newProduct = await prisma.product.create({
      data: {
        name,
        userId: user.id,
        description,
        price: parseFloat(price),
        weight: parseFloat(weight),
        ProductCategory: {
          create: categoryIds.map((categoryId: string) => ({ categoryId })),
        },
      },
    });

    // ✅ Upload Images if provided
    const files = req.files as {
      imagePreview?: Express.Multer.File[];
      imageContent?: Express.Multer.File[];
    };

    if (files?.imagePreview?.[0]) {
      const result = await cloudinary.uploader.upload(
        files.imagePreview[0].path,
        {
          folder: "final-project/products",
        }
      );
      await prisma.image.create({
        data: {
          imageUrl: result.secure_url,
          previewProductId: newProduct.id,
        },
      });
      await fs.unlink(files.imagePreview[0].path);
    }

    if (files?.imageContent?.[0]) {
      const result = await cloudinary.uploader.upload(
        files.imageContent[0].path,
        {
          folder: "final-project/products",
        }
      );
      await prisma.image.create({
        data: {
          imageUrl: result.secure_url,
          contentProductId: newProduct.id,
        },
      });
      await fs.unlink(files.imageContent[0].path);
    }

    // ✅ Link product to store
    for (const item of parsedStoreStocks) {
      await prisma.storeProduct.create({
        data: {
          productId: newProduct.id,
          storeId: item.storeId,
          stock: parseInt(item.stock),
        },
      });
    }

    res.status(201).json({
      message: "Product created successfully with images",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllProductsByCity(req: Request, res: Response) {
  const { province, category } = req.query;

  if (!province || typeof province !== "string") {
    res.status(400).json({ message: "Province parameter is required." });
    return;
  }

  try {
    // Step 1: Get all addresses in that province
    const addresses = await prisma.address.findMany({
      where: {
        province: {
          equals: province,
          mode: "insensitive",
        },
        storeAddressId: { not: null },
      },
      select: { storeAddressId: true },
    });

    const storeAddressIds = addresses.map((addr) => addr.storeAddressId!);

    // Step 2: Get store IDs connected to those addresses
    const storeAddresses = await prisma.storeAddress.findMany({
      where: {
        id: { in: storeAddressIds },
      },
      select: { storeId: true },
    });

    const storeIds = storeAddresses.map((sa) => sa.storeId);

    // Step 3: (NEW) If category filter is present, get matching productIds
    let productIds: string[] | undefined = undefined;

    if (category && typeof category === "string") {
      const products = await prisma.product.findMany({
        where: {
          deletedAt: null,
          ProductCategory: {
            some: {
              Category: {
                name: { equals: category, mode: "insensitive" },
              },
            },
          },
        },
        select: { id: true },
      });

      productIds = products.map((p) => p.id);
    }

    // Step 4: Build WHERE for storeProduct
    const where: any = {
      storeId: { in: storeIds },
      deletedAt: null,
      ...(productIds && { productId: { in: productIds } }),
    };

    // Step 5: Get storeProducts with includes
    const storeProducts = await prisma.storeProduct.findMany({
      where,
      include: {
        Product: {
          include: {
            imagePreview: true,
            ProductCategory: { include: { Category: true } },
          },
        },
        Store: {
          include: {
            StoreAddress: {
              include: {
                Address: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: `Products in province: ${province}`,
      data: storeProducts,
    });
  } catch (error) {
    console.error("Error fetching products by province:", error);
    res.status(500).json({ message: "Error fetching products." });
  }
}

export async function getAllProductsByStore(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const storeId = req.query.storeId as string;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    if (!storeId) {
      res.status(400).json({ message: "storeId is required" });
      return;
    }

    // Step 1: Optional filter productIds by category
    let productIds: string[] | undefined = undefined;

    if (category && typeof category === "string") {
      const products = await prisma.product.findMany({
        where: {
          deletedAt: null,
          ProductCategory: {
            some: {
              Category: {
                name: { equals: category, mode: "insensitive" },
              },
            },
          },
        },
        select: { id: true },
      });

      productIds = products.map((p) => p.id);
    }

    // Step 2: Build dynamic WHERE
    const where: any = {
      storeId,
      deletedAt: null,
      ...(productIds && { productId: { in: productIds } }),
    };

    if (search && typeof search === "string") {
      where.Product = {
        ...where.Product,
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    // Step 3: Query storeProduct with filters
    const storeProducts = await prisma.storeProduct.findMany({
      where,
      include: {
        Product: {
          include: {
            ProductCategory: { include: { Category: true } },
            User: true,
            imageContent: true,
            imagePreview: true,
          },
        },
        Store: true,
      },
    });

    const result = storeProducts.map((item) => ({
      ...item.Product,
      stock: item.stock,
      storeName: item.Store?.name ?? null,
    }));

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error fetching products by store:", error);
    res.status(500).json({ message: "Failed to fetch products by store" });
  }
}

// DELETE PRODUCT
export async function deleteProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.deletedAt) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.productCategory.updateMany({
      where: { productId: id },
      data: { deletedAt: new Date() },
    });

    await prisma.storeProduct.updateMany({
      where: { productId: id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
}

// UPDATE PRODUCT
export async function updateProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, price, weight, stock, categoryIds } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.deletedAt) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
      },
    });

    if (stock !== undefined) {
      await prisma.storeProduct.updateMany({
        where: { productId: id, deletedAt: null },
        data: { stock: parseInt(stock) },
      });
    }

    if (categoryIds) {
      let newCategoryIds = categoryIds;
      if (typeof newCategoryIds === "string") {
        newCategoryIds = [newCategoryIds];
      }

      await prisma.productCategory.updateMany({
        where: { productId: id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      await prisma.productCategory.createMany({
        data: newCategoryIds.map((categoryId: string) => ({
          productId: id,
          categoryId,
        })),
      });
    }

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
}
