import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";
import cloudinary from "../config/cloudinary-config.js";
import fs from "fs/promises";

// GET ALL PRODUCT
export async function getAllProduct(req: Request, res: Response) {
  try {
    // 1. EXTRACT QUERY PARAMETERS
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sort parameters
    const sortBy = (req.query.sortBy as string) || "createdAt"; // default sort by createdAt
    const sortOrder = (req.query.sortOrder as string) || "desc"; // default desc

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ["name", "price", "createdAt", "updatedAt"];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    // Validate sortOrder
    const finalSortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

    // 2. BUILD WHERE CLAUSE
    const where: any = {
      deletedAt: null,
    };

    // Search filter (name contains)
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Category filter
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

    // 3. BUILD ORDER BY CLAUSE
    const orderBy: any = {};
    orderBy[finalSortBy] = finalSortOrder;

    // 4. GET TOTAL COUNT (for pagination info)
    const totalProducts = await prisma.product.count({
      where,
    });

    // 5. QUERY PRODUCTS WITH PAGINATION AND SORTING
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
      orderBy,
      skip,
      take: limit,
    });

    // 6. MAPPING RESULTS (same as before)
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

    // 7. CALCULATE PAGINATION INFO
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 8. RETURN RESPONSE WITH PAGINATION INFO
    res.status(200).json({
      data: finalResult,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search: search || null,
        category: category || null,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder,
      },
    });
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
    if (typeof categoryIds === "string") {
      categoryIds = [categoryIds];
    }

    // ✅ Validasi user authentication
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // ✅ Validasi input required fields
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

    // ✅ Parse storeStocks
    let parsedStoreStocks;
    try {
      parsedStoreStocks = JSON.parse(storeStocks);
    } catch (error) {
      res.status(400).json({ message: "Invalid storeStocks format" });
      return;
    }

    // ✅ Validasi storeStocks tidak kosong
    if (!Array.isArray(parsedStoreStocks) || parsedStoreStocks.length === 0) {
      res.status(400).json({ message: "At least one store is required" });
      return;
    }

    // STORE_ADMIN validation
    if (user.role === "STORE_ADMIN") {
      const userStores = await prisma.store.findMany({
        where: { userId: user.id },
        select: { id: true },
      });

      const userStoreIds = userStores.map((store) => store.id);
      const requestedStoreIds = parsedStoreStocks.map(
        (item: any) => item.storeId
      );

      const invalidStores = requestedStoreIds.filter(
        (storeId: string) => !userStoreIds.includes(storeId)
      );

      if (invalidStores.length > 0) {
        res.status(403).json({
          message: "You don't have permission to add products to these stores",
          invalidStores,
        });
        return;
      }
    }

    // ✅ Validasi category exists
    const validCategories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        deletedAt: null,
      },
    });

    if (validCategories.length !== categoryIds.length) {
      res.status(400).json({ message: "One or more categories not found" });
      return;
    }

    // ✅ Validasi stores exist
    const requestedStoreIds = parsedStoreStocks.map(
      (item: any) => item.storeId
    );
    const validStores = await prisma.store.findMany({
      where: { id: { in: requestedStoreIds } },
    });

    if (validStores.length !== requestedStoreIds.length) {
      res.status(400).json({ message: "One or more stores not found" });
      return;
    }

    // 🔥 NEW: Check for existing product (active or deleted)
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
      },
      include: {
        ProductCategory: true,
        StoreProduct: true,
        imagePreview: true,
        imageContent: true,
      },
    });

    let finalProduct;
    let isRestored = false;

    if (existingProduct) {
      // Jika produk aktif, return error
      if (existingProduct.deletedAt === null) {
        res.status(409).json({ message: "Product name already exists" });
        return;
      }

      // 🔥 RESTORE dan UPDATE produk yang sudah dihapus
      console.log(`Restoring deleted product: ${existingProduct.name}`);

      // 1. Restore produk utama
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          userId: user.id,
          description,
          price: parseFloat(price),
          weight: parseFloat(weight),
          deletedAt: null, // Restore
          updatedAt: new Date(),
        },
      });

      // 2. Hapus kategori lama dan buat yang baru
      await prisma.productCategory.deleteMany({
        where: { productId: existingProduct.id },
      });

      await prisma.productCategory.createMany({
        data: categoryIds.map((categoryId: string) => ({
          productId: existingProduct.id,
          categoryId,
        })),
      });

      // 3. Update/Create StoreProduct
      // Hapus semua storeProduct lama
      await prisma.storeProduct.deleteMany({
        where: { productId: existingProduct.id },
      });

      // Buat storeProduct baru
      for (const item of parsedStoreStocks) {
        await prisma.storeProduct.create({
          data: {
            productId: existingProduct.id,
            storeId: item.storeId,
            stock: parseInt(item.stock),
          },
        });
      }

      finalProduct = existingProduct;
      isRestored = true;
    } else {
      // ✅ Create new product (original logic)
      finalProduct = await prisma.product.create({
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

      // Link product to store
      for (const item of parsedStoreStocks) {
        await prisma.storeProduct.create({
          data: {
            productId: finalProduct.id,
            storeId: item.storeId,
            stock: parseInt(item.stock),
          },
        });
      }
    }

    // ✅ Handle Images (untuk restored product, hapus gambar lama dulu)
    const files = req.files as {
      imagePreview?: Express.Multer.File[];
      imageContent?: Express.Multer.File[];
    };

    if (isRestored) {
      // Hapus gambar lama untuk produk yang di-restore
      await prisma.image.deleteMany({
        where: {
          OR: [
            { previewProductId: finalProduct.id },
            { contentProductId: finalProduct.id },
          ],
        },
      });
    }

    // Upload gambar baru
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
          previewProductId: finalProduct.id,
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
          contentProductId: finalProduct.id,
        },
      });
      await fs.unlink(files.imageContent[0].path);
    }

    // ✅ Response data
    const responseProduct = await prisma.product.findUnique({
      where: { id: finalProduct.id },
      include: {
        ProductCategory: { include: { Category: true } },
        imagePreview: true,
        imageContent: true,
        StoreProduct: { include: { Store: true } },
      },
    });

    res.status(isRestored ? 200 : 201).json({
      message: isRestored
        ? "Product restored and updated successfully"
        : "Product created successfully",
      data: responseProduct,
      isRestored,
    });
  } catch (error) {
    console.error("Error creating/restoring product:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        res.status(409).json({ message: "Product name already exists" });
        return;
      }

      if (error.message.includes("Foreign key constraint")) {
        res.status(400).json({ message: "Invalid category or store ID" });
        return;
      }
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

// ENHANCED getAllProductsByCity with Pagination & Sort
export async function getAllProductsByCity(req: Request, res: Response) {
  try {
    const { province, category } = req.query;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sort parameters
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    // Validate parameters
    if (!province || typeof province !== "string") {
      res.status(400).json({ message: "Province parameter is required." });
      return;
    }

    const allowedSortFields = ["name", "price", "createdAt", "updatedAt"];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const finalSortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

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

    // Step 3: Filter by category if provided
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

    // Step 4: Build WHERE clause
    const where: any = {
      storeId: { in: storeIds },
      deletedAt: null,
      ...(productIds && { productId: { in: productIds } }),
    };

    // Step 5: Get total count
    const totalProducts = await prisma.storeProduct.count({
      where,
    });

    // Step 6: Build orderBy for nested Product relation
    const orderBy: any = {};
    if (finalSortBy === "name" || finalSortBy === "price") {
      orderBy.Product = { [finalSortBy]: finalSortOrder };
    } else {
      orderBy.Product = { [finalSortBy]: finalSortOrder };
    }

    // Step 7: Get storeProducts with pagination
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
      orderBy,
      skip,
      take: limit,
    });

    // Step 8: Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: `Products in province: ${province}`,
      data: storeProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        province,
        category: category || null,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching products by province:", error);
    res.status(500).json({ message: "Error fetching products." });
  }
}

// ENHANCED getAllProductsByStore with Pagination & Sort
export async function getAllProductsByStore(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const storeId = req.query.storeId as string;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sort parameters
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    if (!storeId) {
      res.status(400).json({ message: "storeId is required" });
      return;
    }

    // Validate sort parameters
    const allowedSortFields = ["name", "price", "createdAt", "updatedAt"];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const finalSortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

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

    // Search filter
    if (search && typeof search === "string") {
      where.Product = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    // Step 3: Get total count
    const totalProducts = await prisma.storeProduct.count({
      where,
    });

    // Step 4: Build orderBy
    const orderBy: any = {};
    if (finalSortBy === "name" || finalSortBy === "price") {
      orderBy.Product = { [finalSortBy]: finalSortOrder };
    } else {
      orderBy.Product = { [finalSortBy]: finalSortOrder };
    }

    // Step 5: Query storeProduct with filters and pagination
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
      orderBy,
      skip,
      take: limit,
    });

    // Step 6: Map results
    const result = storeProducts.map((item) => ({
      ...item.Product,
      stock: item.stock,
      storeName: item.Store?.name ?? null,
    }));

    // Step 7: Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      data: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        storeId,
        search: search || null,
        category: category || null,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder,
      },
    });
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
    const { name, description, price, weight, categoryIds, storeStocks } =
      req.body;
    const user = req.user as CustomJwtPayload;

    // ✅ Validasi user authentication
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // ✅ Validasi product exists dan belum dihapus
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        StoreProduct: { include: { Store: true } },
      },
    });

    if (!product || product.deletedAt) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // 🔥 NEW: Validasi ownership untuk STORE_ADMIN
    if (user.role === "STORE_ADMIN") {
      // Check apakah user adalah pemilik produk
      if (product.userId !== user.id) {
        res.status(403).json({
          message: "You don't have permission to update this product",
        });
        return;
      }

      // Jika ada storeStocks, pastikan semua store adalah milik user
      if (storeStocks) {
        const userStores = await prisma.store.findMany({
          where: { userId: user.id },
          select: { id: true },
        });

        const userStoreIds = userStores.map((store) => store.id);
        let parsedStoreStocks;

        try {
          parsedStoreStocks = JSON.parse(storeStocks);
        } catch (error) {
          res.status(400).json({ message: "Invalid storeStocks format" });
          return;
        }

        const requestedStoreIds = parsedStoreStocks.map(
          (item: any) => item.storeId
        );
        const invalidStores = requestedStoreIds.filter(
          (storeId: string) => !userStoreIds.includes(storeId)
        );

        if (invalidStores.length > 0) {
          res.status(403).json({
            message:
              "You don't have permission to update stock for these stores",
            invalidStores,
          });
          return;
        }
      }
    }

    // ✅ Validasi duplicate name (kecuali untuk produk ini sendiri)
    if (name && name !== product.name) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          deletedAt: null,
          id: { not: id },
        },
      });

      if (existingProduct) {
        res.status(409).json({ message: "Product name already exists" });
        return;
      }
    }

    // ✅ Validasi categories jika ada
    if (categoryIds) {
      let newCategoryIds = categoryIds;
      if (typeof newCategoryIds === "string") {
        newCategoryIds = [newCategoryIds];
      }

      const validCategories = await prisma.category.findMany({
        where: {
          id: { in: newCategoryIds },
          deletedAt: null,
        },
      });

      if (validCategories.length !== newCategoryIds.length) {
        res.status(400).json({ message: "One or more categories not found" });
        return;
      }
    }

    // ✅ Update basic product info
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (weight) updateData.weight = parseFloat(weight);

    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({
        where: { id },
        data: updateData,
      });
    }

    // 🔥 NEW: Update Images if provided
    const files = req.files as {
      imagePreview?: Express.Multer.File[];
      imageContent?: Express.Multer.File[];
    };

    if (files?.imagePreview?.[0]) {
      // Hapus image preview lama
      await prisma.image.deleteMany({
        where: { previewProductId: id },
      });

      // Upload image preview baru
      const result = await cloudinary.uploader.upload(
        files.imagePreview[0].path,
        {
          folder: "final-project/products",
        }
      );

      await prisma.image.create({
        data: {
          imageUrl: result.secure_url,
          previewProductId: id,
        },
      });

      await fs.unlink(files.imagePreview[0].path);
    }

    if (files?.imageContent?.[0]) {
      // Hapus image content lama
      await prisma.image.deleteMany({
        where: { contentProductId: id },
      });

      // Upload image content baru
      const result = await cloudinary.uploader.upload(
        files.imageContent[0].path,
        {
          folder: "final-project/products",
        }
      );

      await prisma.image.create({
        data: {
          imageUrl: result.secure_url,
          contentProductId: id,
        },
      });

      await fs.unlink(files.imageContent[0].path);
    }

    // 🔥 NEW: Update stock per store (bukan semua store)
    if (storeStocks) {
      let parsedStoreStocks;
      try {
        parsedStoreStocks = JSON.parse(storeStocks);
      } catch (error) {
        res.status(400).json({ message: "Invalid storeStocks format" });
        return;
      }

      // Validasi stores exist
      const requestedStoreIds = parsedStoreStocks.map(
        (item: any) => item.storeId
      );
      const validStores = await prisma.store.findMany({
        where: { id: { in: requestedStoreIds } },
      });

      if (validStores.length !== requestedStoreIds.length) {
        res.status(400).json({ message: "One or more stores not found" });
        return;
      }

      // Update stock untuk setiap store
      for (const item of parsedStoreStocks) {
        await prisma.storeProduct.upsert({
          where: {
            productId_storeId: {
              productId: id,
              storeId: item.storeId,
            },
          },
          update: {
            stock: parseInt(item.stock),
            deletedAt: null, // Reset deletedAt jika ada
          },
          create: {
            productId: id,
            storeId: item.storeId,
            stock: parseInt(item.stock),
          },
        });
      }
    }

    // ✅ Update categories
    if (categoryIds) {
      let newCategoryIds = categoryIds;
      if (typeof newCategoryIds === "string") {
        newCategoryIds = [newCategoryIds];
      }

      //delete categories lama

      await prisma.productCategory.deleteMany({
        where: {
          productId: product.id,
        },
      });

      // Buat categories baru
      await prisma.productCategory.createMany({
        data: newCategoryIds.map((categoryId: string) => ({
          productId: id,
          categoryId,
        })),
      });
    }

    // ✅ Return updated product dengan relasi lengkap
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        ProductCategory: {
          where: { deletedAt: null },
          include: { Category: true },
        },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: {
          where: { deletedAt: null },
          include: { Store: true },
        },
      },
    });

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    // 🔥 NEW: Better error handling
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        res.status(409).json({ message: "Product name already exists" });
        return;
      }

      if (error.message.includes("Foreign key constraint")) {
        res.status(400).json({ message: "Invalid category or store ID" });
        return;
      }
    }

    res.status(500).json({ message: "Failed to update product" });
  }
}
