"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  weight: number;
  category: string[];
  imagePreview: [{ imageUrl: string }];
}

export default function CreateProductPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/products", {
          withCredentials: true,
        });
        setProducts(res.data.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/products/${id}`, {
        withCredentials: true,
      });
      alert("Product deleted successfully.");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  const handleUpdateProduct = async (id: string) => {
    const newName = prompt("Enter new name:");
    if (!newName) return;

    try {
      await axios.patch(
        `http://localhost:8000/api/v1/products/${id}`,
        { name: newName },
        { withCredentials: true }
      );
      alert("Product updated successfully.");
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
      );
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  return (
    <section className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Products</h1>
        <Link
          href="/dashboard/admin/product/create"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-xl shadow hover:shadow-lg transition bg-white flex flex-col overflow-hidden"
            >
              <Image
                src={product.imagePreview?.[0]?.imageUrl ?? "/placeholder.jpg"}
                alt={product.name}
                width={300}
                height={300}
                className="object-contain w-full h-48 bg-white"
              />
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                <p className="text-gray-700 mb-2">{product.description}</p>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>
                    <span className="font-medium">Price:</span> ${product.price}
                  </p>
                  <p>
                    <span className="font-medium">Stock:</span> {product.stock}
                  </p>
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {product.category.join(", ")}
                  </p>
                </div>
                <div className="flex justify-between space-x-2 mt-auto">
                  <button
                    onClick={() => handleUpdateProduct(product.id)}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
