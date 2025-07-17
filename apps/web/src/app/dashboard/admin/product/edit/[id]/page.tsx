"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

interface Store {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>("");

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [imagePreviewFile, setImagePreviewFile] = useState<File | null>(null);
  const [imageContentFile, setImageContentFile] = useState<File | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeStocks, setStoreStocks] = useState<
    { storeId: string; stock: number }[]
  >([]);

  // Loading
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    async function fetchAllData() {
      try {
        setLoading(true);

        // ✅ paralel fetch
        const [productRes, categoriesRes, storesRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/v1/products/${id}`, {
            withCredentials: true,
          }),
          axios.get("http://localhost:8000/api/v1/categories", {
            withCredentials: true,
          }),
          axios.get("http://localhost:8000/api/v1/stores", {
            withCredentials: true,
          }),
        ]);

        const product = productRes.data.data;
        setCategories(categoriesRes.data.data);
        setStores(storesRes.data.data);

        // ✅ setelah categories dan stores siap → set form
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setWeight(product.weight);
        setCategoryId(product.categoryIds?.[0] ?? "");
        setStoreStocks(product.storeStocks ?? []);
        setImagePreviewUrl(product.imagePreview?.[0]?.imageUrl ?? "");

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    }

    fetchAllData();
  }, [id]);

  // Handle update
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      !description ||
      !price ||
      !weight ||
      !categoryId ||
      storeStocks.length === 0
    ) {
      alert("Missing required fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", String(price));
      formData.append("weight", String(weight));
      formData.append("storeStocks", JSON.stringify(storeStocks));
      formData.append("categoryIds", categoryId);
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

      alert("Product updated successfully.");
      router.push("/dashboard/admin/product");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleUpdateProduct}
        className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-4 overflow-y-auto max-h-[90vh]"
      >
        <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
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
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
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

        <div>
          <label className="block mb-1 font-medium">
            Current Image Preview
          </label>
          {imagePreviewUrl && (
            <Image
              src={imagePreviewUrl}
              alt="Current Preview"
              width={150}
              height={150}
              className="object-contain bg-white border rounded mb-2"
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
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageContentFile(e.target.files?.[0] ?? null)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Set Stock for Each Store
          </label>
          <div className="space-y-2">
            {stores.map((store) => (
              <div key={store.id} className="flex items-center space-x-2">
                <label className="w-1/3">{store.name}</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-2/3"
                  value={
                    storeStocks.find((s) => s.storeId === store.id)?.stock ?? 0
                  }
                  onChange={(e) => {
                    const newStock = Number(e.target.value);
                    setStoreStocks((prev) => {
                      const exists = prev.find((s) => s.storeId === store.id);
                      if (exists) {
                        return prev.map((s) =>
                          s.storeId === store.id ? { ...s, stock: newStock } : s
                        );
                      } else {
                        return [
                          ...prev,
                          { storeId: store.id, stock: newStock },
                        ];
                      }
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/product")}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
}
