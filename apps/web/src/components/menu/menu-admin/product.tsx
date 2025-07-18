"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  weight?: number;
  category: string[];
  imagePreview: { imageUrl: string }[];
}

export default function ProductAdminPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/products", {
          params: {
            page,
            limit: 10,
            search,
            category,
            sortBy,
            sortOrder,
          },
          withCredentials: true,
        });

        setProducts(res.data.data);
        setTotalPages(res.data.meta.totalPages);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }

    fetchProducts();
  }, [page, search, category, sortBy, sortOrder]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/categories", {
          withCredentials: true,
        });
        setCategories(res.data.data); // ← pastikan response-nya ada di `data`
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }

    fetchCategories();
  }, []);

  const confirmDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!productToDelete) return;

    try {
      await axios.delete(
        `http://localhost:8000/api/v1/products/${productToDelete.id}`,
        {
          withCredentials: true,
        }
      );
      alert("Product deleted successfully.");
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    } finally {
      setShowModal(false);
      setProductToDelete(null);
    }
  };

  const handleUpdateProduct = (id: string) => {
    router.push(`/dashboard/admin/product/edit/${id}`);
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

      {/* Filter & Sort */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-1 rounded"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-1 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="border px-3 py-1 rounded"
        >
          {sortBy === "name" ? (
            <>
              <option value="asc">🔤 A to Z</option>
              <option value="desc">🔡 Z to A</option>
            </>
          ) : (
            <>
              <option value="asc">💸 Lowest to Highest</option>
              <option value="desc">💰 Highest to Lowest</option>
            </>
          )}
        </select>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Image</th>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Description</th>
                <th className="border px-4 py-2 text-left">Price</th>
                <th className="border px-4 py-2 text-left">Category</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">
                    <Image
                      src={
                        product.imagePreview?.[0]?.imageUrl ??
                        "/placeholder.jpg"
                      }
                      alt={product.name}
                      width={80}
                      height={80}
                      className="object-contain bg-white"
                    />
                  </td>
                  <td className="border px-4 py-2">{product.name}</td>
                  <td className="border px-4 py-2">{product.description}</td>
                  <td className="border px-4 py-2">
                    Rp{product.price.toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">
                    {product.category.join(", ")}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleUpdateProduct(product.id)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white font-medium px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDeleteProduct(product)}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages >= 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && productToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full pointer-events-auto border border-gray-300">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{productToDelete.name}</span>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowModal(false);
                  setProductToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteConfirmed}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
