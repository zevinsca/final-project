"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage({
  params,
}: {
  params: { storeId: string };
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [stock, setStock] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setUploading(true);
    const files = Array.from(e.target.files);

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("http://localhost:8000/api/v1/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!res.ok) {
          console.error("Upload failed:", res.statusText);
          continue;
        }

        const data = await res.json();
        if (data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    setImageUrls(uploadedUrls);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { storeId } = params;

      const res = await fetch("http://localhost:8000/api/v1/products", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          storeId,
          description,
          price: parseFloat(price),
          weight: parseFloat(weight),
          stock: parseInt(stock),
          categoryIds,
          imageUrls,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.message}`);
        return;
      }

      alert("Product created successfully!");
      setShowModal(false);

      router.refresh();
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product.");
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Add New Product
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <input
                type="number"
                placeholder="Weight (grams)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <input
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <input
                type="text"
                placeholder="Category IDs (comma separated)"
                onChange={(e) =>
                  setCategoryIds(
                    e.target.value
                      .split(",")
                      .map((id) => id.trim())
                      .filter((id) => id !== "")
                  )
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              <div>
                <label className="block mb-1 font-medium">Upload Images</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  accept="image/*"
                />
                {uploading && (
                  <p className="text-sm text-gray-500">Uploading...</p>
                )}
                {imageUrls.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-green-600">
                    {imageUrls.map((url, idx) => (
                      <li key={idx}>{url}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {uploading ? "Uploading..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
