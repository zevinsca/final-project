"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import MenuNavbarStoreAdmin from "@/components/header/header-admin-store/header-admin-store";

interface Order {
  id: string;
  orderNumber: string;
  recipientName: string;
  items: {
    name: string;
    quantity: number;
  }[];
  paymentMethod: "epayment" | "manual";
  paymentProofUrl?: string;
  paymentStatus: "pending" | "paid" | "failed";
  isDelivered: boolean;
  isDone: boolean;
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/orders", {
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok) {
          setOrders(json.data);
        } else {
          console.error("Failed to load orders:", json.message);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    }

    fetchOrders();
  }, []);

  return (
    <MenuNavbarStoreAdmin>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Manage Orders</h1>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full table-auto border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left">No</th>
                <th className="p-3 text-left">Order Number</th>
                <th className="p-3 text-left">Recipient</th>
                <th className="p-3 text-left">Order Details</th>
                <th className="p-3 text-left">Payment Method</th>
                <th className="p-3 text-left">Proof of Payment</th>
                <th className="p-3 text-left">Payment Status</th>
                <th className="p-3 text-left">Delivered</th>
                <th className="p-3 text-left">Done</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{order.orderNumber}</td>
                    <td className="p-3">{order.recipientName}</td>
                    <td className="p-3 text-sm">
                      <ul className="list-disc pl-4">
                        {order.items.map((item, i) => (
                          <li key={i}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3 capitalize">{order.paymentMethod}</td>
                    <td className="p-3">
                      {order.paymentProofUrl ? (
                        <a
                          href={order.paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={order.paymentProofUrl}
                            alt="Proof"
                            width={60}
                            height={60}
                            className="rounded border"
                          />
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td
                      className={`p-3 font-medium ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : order.paymentStatus === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {order.paymentStatus}
                    </td>
                    <td className="p-3">{order.isDelivered ? "✅" : "❌"}</td>
                    <td className="p-3">{order.isDone ? "✅" : "❌"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MenuNavbarStoreAdmin>
  );
}
