import cloudinary from "../config/cloudinary-config.js";
import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";

export const handleManualCheckout = async (req: Request, res: Response) => {
  try {
    //const userId = req.user.id;

    let { address, shippingOptions, cartItems } = req.body;

    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "No payment proof uploaded." });
      return;
    }

    console.log(file.mimetype);

    // Upload image to Cloudinary
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    const uploadRes = await cloudinary.uploader.upload(base64Image, {
      folder: "payment_proofs",
    });

    // Parse address/cart
    const parsedAddress = JSON.parse(address);
    const parsedCart = JSON.parse(cartItems);
    const parsedShipping = JSON.parse(shippingOptions);
    cartItems = JSON.parse(cartItems);

    //TODO::shipping cost harus di calculate ulang disini melalui backend. ga boleh data nya dikirim dr front end, supaya ga ada exploit untuk manipulasi data nominal shipping
    let totalWeight = cartItems.reduce(
      (sum, item) => sum + item.Product.weight * item.quantity,
      0
    );

    let subtotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.Product.price) * item.quantity,
      0
    );

    console.log(JSON.stringify(parsedShipping));
    const queryParams = new URLSearchParams({
      shipper_destination_id: "501", // your warehouse
      receiver_destination_id: parsedAddress.Address.destinationId,
      weight: totalWeight.toString(),
      item_value: subtotal.toString(),
      cod: "false",
    });
    console.log(JSON.stringify(queryParams));

    const response = await fetch(
      `http://localhost:8000/api/v1/rajaongkir/calculate?${queryParams}`
    );
    const result = await response.json();

    console.log(JSON.stringify(result));

    if (!response.ok || !result.data || result.data.length === 0) {
      res.status(400).json({ message: "Failed to calculate shipping cost." });
      return;
    }

    let shippingData = result.data;
    let shippingCost = 0;

    let regularShippings = result.data?.calculate_reguler;

    regularShippings.forEach((cost) => {
      if (
        cost.shipping_name == shippingOptions.shipping_name &&
        cost.service_name == shippingOptions.service_name
      ) {
        shippingCost = cost.grandtotal;
      }
    });

    // Calculate subtotal and total
    const subTotal = parsedCart.reduce(
      (sum, item) =>
        sum + item.Product.price * item.Product.weight * item.quantity,
      0
    );
    const totalPrice = subTotal + shippingCost;

    console.log("ADDRESSID" + parsedAddress.addressId);

    const newOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        subTotal,
        totalPrice,
        // paymentMethod: "manual",
        // paymentProofUrl: uploadRes.secure_url,
        // paymentStatus: "PENDING",
        shippingOptions: parsedShipping,
        shippingTotal: shippingCost,
        Address: {
          connect: {
            id: parsedAddress.addressId,
          },
        },
        User: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });

    res
      .status(200)
      .json({ message: "Manual payment submitted", data: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during manual checkout" });
  }
};
