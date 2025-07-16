"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

interface StoreStock {
  storeId: string;
  storeName: string;
  stock: number;
}

interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  ProductCategory: {
    Category: {
      id: string;
      name: string;
    };
  }[];
  StoreProduct: {
    Store: {
      id: string;
      name: string;
    };
    stock: number;
  }[];
  imagePreview?: { imageUrl: string }[];
  imageContent?: { imageUrl: string }[];
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageContentUrl, setImageContentUrl] = useState<string | null>(null);
  const [imagePreviewFile, setImagePreviewFile] = useState<File | null>(null);
  const [imageContentFile, setImageContentFile] = useState<File | null>(null);

  const [stockPerStore, setStockPerStore] = useState<StoreStock[]>([]);

  // ✅ Fetch product & category data
  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          axios.get<{ data: ProductDetail }>(
            `http://localhost:8000/api/v1/products/${id}`,
            {
              withCredentials: true,
            }
          ),
          axios.get<{ data: Category[] }>(
            "http://localhost:8000/api/v1/categories",
            {
              withCredentials: true,
            }
          ),
        ]);

        const product = productRes.data.data;
        setCategories(categoriesRes.data.data);

        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setWeight(product.weight);
        setCategoryIds(product.ProductCategory.map((pc) => pc.Category.id));

        setImagePreviewUrl(product.imagePreview?.[0]?.imageUrl ?? null);
        setImageContentUrl(product.imageContent?.[0]?.imageUrl ?? null);

        setStockPerStore(
          product.StoreProduct.map((sp) => ({
            storeId: sp.Store.id,
            storeName: sp.Store.name,
            stock: sp.stock,
          }))
        );
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to load product data.");
      }
    }

    fetchData();
  }, [id]);

  // ✅ Handle submit
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", String(price));
      formData.append("weight", String(weight));
      formData.append("categoryIds", JSON.stringify(categoryIds));
      formData.append("stockPerStore", JSON.stringify(stockPerStore));

      if (imagePreviewFile) formData.append("imagePreview", imagePreviewFile);
      if (imageContentFile) formData.append("imageContent", imageContentFile);

      await axios.patch(
        `http://localhost:8000/api/v1/products/${id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Product updated successfully!");
      router.push("/dashboard/admin/product");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  return (
    <section className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <form
        onSubmit={handleUpdateProduct}
        className="bg-white p-6 rounded shadow space-y-4"
      >
        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Price and Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Weight</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <select
            multiple
            value={categoryIds}
            onChange={(e) =>
              setCategoryIds(
                Array.from(e.target.selectedOptions).map((o) => o.value)
              )
            }
            required
            className="w-full border rounded px-3 py-2"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Images */}
        <div>
          <label className="block mb-1 font-medium">Image Preview</label>
          {imagePreviewUrl && (
            <Image
              src={imagePreviewUrl}
              alt="Current Preview"
              width={200}
              height={200}
              className="mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagePreviewFile(e.target.files?.[0] ?? null)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Image Content (optional)
          </label>
          {imageContentUrl && (
            <Image
              src={imageContentUrl}
              alt="Current Content"
              width={200}
              height={200}
              className="mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageContentFile(e.target.files?.[0] ?? null)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Stock per store */}
        <div>
          <label className="block mb-1 font-medium">Stock per Store</label>
          <div className="space-y-2">
            {stockPerStore.map((s, idx) => (
              <div key={s.storeId} className="flex gap-2 items-center">
                <span className="min-w-[100px]">{s.storeName}</span>
                <input
                  type="number"
                  value={s.stock}
                  onChange={(e) => {
                    const newStock = parseInt(e.target.value);
                    setStockPerStore((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, stock: newStock } : item
                      )
                    );
                  }}
                  className="border rounded px-2 py-1 w-24"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/product")}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}
