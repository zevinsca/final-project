// import { Request, Response } from "express";
// import { PrismaClient } from "../generated/prisma/index.js";
// import { v7 as uuid } from "uuid";

// const prisma = new PrismaClient();

// export async function createDiscount(req: Request, res: Response) {
//   try {
//     const { discountPercent, validUntil, eventId, ticketId } = req.body;

//     if (!discountPercent || !validUntil || !eventId) {
//       res.status(400).json({
//         message: "discountPercent, validUntil, dan eventId wajib diisi",
//       });
//       return;
//     }

//     const ticket = await prisma.discount.findFirst({
//       where: {
//         id: ticketId,
//         eventId: eventId,
//       },
//     });
//     const discount = await prisma.discount.create({
//       data: {
//         discountPercent: Number(discountPercent),
//         validUntil: new Date(validUntil),
//         eventId,
//         ticketId,
//       },
//     });

//     res
//       .status(201)
//       .json({ message: "Discount berhasil dibuat", data: discount });
//     return;
//   } catch (error) {
//     console.error("createDiscount error:", error);
//     res.status(500).json({ message: "Gagal membuat discount" });
//     return;
//   }
// }

// export async function getDiscounts(req: Request, res: Response) {
//   try {
//     const discounts = await prisma.discount.findMany({
//       include: {
//         Event: true,
//         Ticket: true,
//       },
//     });
//     res.status(200).json({ data: discounts });
//     return;
//   } catch (error) {
//     console.error("getDiscounts error:", error);
//     res.status(500).json({ message: "Gagal mengambil data discount" });
//     return;
//   }
// }

// export async function getDiscountById(req: Request, res: Response) {
//   try {
//     const { id } = req.params;

//     const discount = await prisma.discount.findUnique({
//       where: { id },
//       include: { Event: true, Ticket: true },
//     });

//     if (!discount) {
//       res.status(404).json({ message: "Discount tidak ditemukan" });
//       return;
//     }

//     res.status(200).json({ data: discount });
//     return;
//   } catch (error) {
//     console.error("getDiscountById error:", error);
//     res.status(500).json({ message: "Gagal mengambil discount" });
//     return;
//   }
// }

// export async function updateDiscount(req: Request, res: Response) {
//   try {
//     const { id } = req.params;
//     const { discountPercent, validUntil, eventId, ticketId } = req.body;

//     const discountExist = await prisma.discount.findUnique({ where: { id } });
//     if (!discountExist) {
//       res.status(404).json({ message: "Discount tidak ditemukan" });
//       return;
//     }

//     const updated = await prisma.discount.update({
//       where: { id },
//       data: {
//         discountPercent,
//         validUntil: validUntil
//           ? new Date(validUntil)
//           : discountExist.validUntil,
//         eventId,
//         ticketId: ticketId ?? null,
//       },
//     });

//     res
//       .status(200)
//       .json({ message: "Discount berhasil diupdate", data: updated });
//     return;
//   } catch (error) {
//     console.error("updateDiscount error:", error);
//     res.status(500).json({ message: "Gagal mengupdate discount" });
//     return;
//   }
// }

// export async function deleteDiscount(req: Request, res: Response) {
//   try {
//     const { id } = req.params;

//     const discountExist = await prisma.discount.findUnique({ where: { id } });
//     if (!discountExist) {
//       res.status(404).json({ message: "Discount tidak ditemukan" });
//       return;
//     }

//     await prisma.discount.delete({ where: { id } });

//     res.status(200).json({ message: "Discount berhasil dihapus" });
//     return;
//   } catch (error) {
//     console.error("deleteDiscount error:", error);
//     res.status(500).json({ message: "Gagal menghapus discount" });
//   }
// }
