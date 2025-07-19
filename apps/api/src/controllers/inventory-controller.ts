import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";
import { InventoryAction } from "../../generated/prisma/index.js";

/* -------------------------------------------------------------------------- */
/*                             GET INVENTORY DATA                             */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/inventory
 * Mendapatkan data inventory berdasarkan role user
 * - SUPER_ADMIN: bisa lihat semua toko
 * - STORE_ADMIN: hanya toko miliknya
 */
export async function getInventoryData(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const { storeId, productId, page = 1, limit = 10 } = req.query;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause berdasarkan role
    let whereClause: any = {
      deletedAt: null,
    };

    // Filter berdasarkan role
    if (user.role === "STORE_ADMIN") {
      // Store admin hanya bisa lihat tokonya sendiri
      const userStores = await prisma.store.findMany({
        where: { userId: user.id },
        select: { id: true },
      });

      const userStoreIds = userStores.map((store) => store.id);
      whereClause.storeId = { in: userStoreIds };
    } else if (storeId) {
      // Super admin bisa filter berdasarkan storeId
      whereClause.storeId = storeId as string;
    }

    // Filter berdasarkan productId jika ada
    if (productId) {
      whereClause.productId = productId as string;
    }

    // Get total count
    const totalItems = await prisma.storeProduct.count({ where: whereClause });

    // Get inventory data dengan relasi
    const inventoryData = await prisma.storeProduct.findMany({
      where: whereClause,
      include: {
        Product: {
          include: {
            imagePreview: true,
            ProductCategory: {
              include: { Category: true },
            },
          },
        },
        Store: {
          include: {
            StoreAddress: {
              include: { Address: true },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limitNum,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      message: "Inventory data retrieved successfully",
      data: inventoryData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error getting inventory data:", error);
    res.status(500).json({ message: "Failed to get inventory data" });
  }
}

/* -------------------------------------------------------------------------- */
/*                            UPDATE STOCK WITH JOURNAL                       */
/* -------------------------------------------------------------------------- */

/**
 * POST /api/inventory
 * Update stok dengan mencatat di inventory journal
 */
export async function updateStockWithJournal(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const { storeId, productId, quantity, action, reason } = req.body;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Validasi input
    if (!storeId || !productId || !quantity || !action) {
      res.status(400).json({
        message: "storeId, productId, quantity, and action are required",
      });
      return;
    }

    // Validasi action
    const validActions: InventoryAction[] = ["RESTOCK", "SALE", "ADD"];
    if (!validActions.includes(action)) {
      res.status(400).json({
        message: "Invalid action. Must be RESTOCK, SALE, or ADD",
      });
      return;
    }

    // Validasi quantity harus positif
    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0) {
      res.status(400).json({ message: "Quantity must be positive" });
      return;
    }

    // Validasi permission untuk store admin
    if (user.role === "STORE_ADMIN") {
      const userStore = await prisma.store.findFirst({
        where: {
          id: storeId,
          userId: user.id,
        },
      });

      if (!userStore) {
        res.status(403).json({
          message: "You don't have permission to update this store's inventory",
        });
        return;
      }
    }

    // Cek apakah store dan product exist
    const [store, product] = await Promise.all([
      prisma.store.findUnique({ where: { id: storeId } }),
      prisma.product.findUnique({
        where: { id: productId, deletedAt: null },
      }),
    ]);

    if (!store) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Get current stock
    const currentStoreProduct = await prisma.storeProduct.findUnique({
      where: {
        productId_storeId: {
          productId,
          storeId,
        },
      },
    });

    const currentStock = currentStoreProduct?.stock || 0;

    // Calculate new stock berdasarkan action
    let newStock: number;
    let actualQuantity: number;

    switch (action) {
      case "ADD":
      case "RESTOCK":
        newStock = currentStock + quantityNum;
        actualQuantity = quantityNum;
        break;
      case "SALE":
        if (currentStock < quantityNum) {
          res.status(400).json({
            message: `Insufficient stock. Current: ${currentStock}, Requested: ${quantityNum}`,
          });
          return;
        }
        newStock = currentStock - quantityNum;
        actualQuantity = -quantityNum; // Negative untuk menunjukkan pengurangan
        break;
      default:
        res.status(400).json({ message: "Invalid action" });
        return;
    }

    // Transaksi database
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat inventory journal entry
      const inventoryJournal = await tx.inventoryJournal.create({
        data: {
          storeId,
          productId,
          quantity: actualQuantity.toString(),
          weight: product.weight,
          action: action as InventoryAction,
          userId: user.id,
        },
      });

      // 2. Update atau create store product
      const updatedStoreProduct = await tx.storeProduct.upsert({
        where: {
          productId_storeId: {
            productId,
            storeId,
          },
        },
        update: {
          stock: newStock,
          updatedAt: new Date(),
        },
        create: {
          productId,
          storeId,
          stock: newStock,
        },
        include: {
          Product: {
            include: {
              imagePreview: true,
              ProductCategory: {
                include: { Category: true },
              },
            },
          },
          Store: true,
        },
      });

      return { inventoryJournal, updatedStoreProduct };
    });

    res.status(200).json({
      message: "Stock updated successfully",
      data: {
        inventoryJournal: result.inventoryJournal,
        storeProduct: result.updatedStoreProduct,
        previousStock: currentStock,
        newStock,
        quantityChanged: actualQuantity,
      },
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Failed to update stock" });
  }
}

/* -------------------------------------------------------------------------- */
/*                            GET INVENTORY HISTORY                           */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/inventory/history
 * Mendapatkan history perubahan inventory
 */
export async function getInventoryHistory(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const {
      storeId,
      productId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    let whereClause: any = {};

    // Filter berdasarkan role
    if (user.role === "STORE_ADMIN") {
      const userStores = await prisma.store.findMany({
        where: { userId: user.id },
        select: { id: true },
      });

      const userStoreIds = userStores.map((store) => store.id);
      whereClause.storeId = { in: userStoreIds };
    } else if (storeId) {
      whereClause.storeId = storeId as string;
    }

    // Filter lainnya
    if (productId) whereClause.productId = productId as string;
    if (action) whereClause.action = action as InventoryAction;

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate as string);
      }
    }

    // Get total count
    const totalItems = await prisma.inventoryJournal.count({
      where: whereClause,
    });

    // Get history data
    const historyData = await prisma.inventoryJournal.findMany({
      where: whereClause,
      include: {
        Store: true,
        Product: {
          include: {
            imagePreview: true,
            ProductCategory: {
              include: { Category: true },
            },
          },
        },
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limitNum,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      message: "Inventory history retrieved successfully",
      data: historyData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error getting inventory history:", error);
    res.status(500).json({ message: "Failed to get inventory history" });
  }
}

/* -------------------------------------------------------------------------- */
/*                            GET LOW STOCK ALERTS                            */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/inventory/low-stock
 * Mendapatkan produk dengan stok rendah (threshold: 10)
 */
export async function getLowStockAlerts(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const { threshold = 10 } = req.query;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const thresholdNum = parseInt(threshold as string);

    // Build where clause berdasarkan role
    let whereClause: any = {
      deletedAt: null,
      stock: {
        lte: thresholdNum,
      },
    };

    // Filter berdasarkan role
    if (user.role === "STORE_ADMIN") {
      const userStores = await prisma.store.findMany({
        where: { userId: user.id },
        select: { id: true },
      });

      const userStoreIds = userStores.map((store) => store.id);
      whereClause.storeId = { in: userStoreIds };
    }

    const lowStockItems = await prisma.storeProduct.findMany({
      where: whereClause,
      include: {
        Product: {
          include: {
            imagePreview: true,
            ProductCategory: {
              include: { Category: true },
            },
          },
        },
        Store: true,
      },
      orderBy: {
        stock: "asc", // Stok terendah dulu
      },
    });

    res.status(200).json({
      message: "Low stock items retrieved successfully",
      data: lowStockItems,
      threshold: thresholdNum,
      totalLowStockItems: lowStockItems.length,
    });
  } catch (error) {
    console.error("Error getting low stock alerts:", error);
    res.status(500).json({ message: "Failed to get low stock alerts" });
  }
}
