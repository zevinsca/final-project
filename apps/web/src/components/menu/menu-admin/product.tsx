"use client";

import { useEffect, useState } from "react";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>(""); // Single category selected
  const [storeId, setStoreId] = useState<string>("");

  // State untuk langkah formulir (1 untuk langkah pertama, 2 untuk langkah kedua)
  const [currentStep, setCurrentStep] = useState(1);

  // State untuk menampilkan atau menyembunyikan modal
  const [showModal, setShowModal] = useState(false);

  // Mengambil data kategori, toko, dan produk
  useEffect(() => {
    async function fetchData() {
      try {
        const categoriesRes = await axios.get(
          "http://localhost:8000/api/v1/categories",
          {
            withCredentials: true,
          }
        );
        setCategories(categoriesRes.data.data);

        const storesRes = await axios.get(
          "http://localhost:8000/api/v1/stores",
          {
            withCredentials: true,
          }
        );
        setStores(storesRes.data.data);

        const productsRes = await axios.get(
          "http://localhost:8000/api/v1/products",
          {
            withCredentials: true,
          }
        );
        setProducts(productsRes.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData();
  }, []);

  // Menangani pembuatan produk
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi apakah semua kolom wajib diisi
    if (
      !name ||
      !description ||
      !price ||
      !stock ||
      !weight ||
      !categoryId ||
      !storeId
    ) {
      alert("Missing required fields or no category selected.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/products",
        {
          name,
          description,
          price,
          stock,
          weight,
          categoryIds: [categoryId], // Single category selected
          storeId,
        },
        { withCredentials: true }
      );

      console.log("Product created:", response.data);
      alert("Product created successfully.");
      // Reset form dan tutup modal
      setName("");
      setDescription("");
      setPrice(0);
      setStock(0);
      setWeight(0);
      setCategoryId(""); // Reset category selection
      setStoreId("");
      setShowModal(false); // Sembunyikan modal

      // Update list produk
      const productsRes = await axios.get(
        "http://localhost:8000/api/v1/products",
        {
          withCredentials: true,
        }
      );
      setProducts(productsRes.data.data);
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product.");
    }
  };

  // Menangani perubahan langkah formulir
  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>

      {/* Tombol untuk membuka modal */}
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6"
      >
        Create New Product
      </button>

      {/* Modal untuk pembuatan produk baru */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {currentStep === 1
                ? "Step 1: Product Details"
                : "Step 2: Category and Store"}
            </h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Langkah 1 - Detail Produk */}
              {currentStep === 1 && (
                <>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="name">
                      Product Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-1 font-medium"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium" htmlFor="price">
                      Price
                    </label>
                    <input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium" htmlFor="stock">
                      Stock
                    </label>
                    <input
                      id="stock"
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium" htmlFor="weight">
                      Weight
                    </label>
                    <input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </>
              )}

              {/* Langkah 2 - Kategori dan Toko */}
              {currentStep === 2 && (
                <>
                  <div>
                    <label
                      className="block mb-1 font-medium"
                      htmlFor="category"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
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
                    <label className="block mb-1 font-medium" htmlFor="store">
                      Select Store
                    </label>
                    <select
                      id="store"
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Select a Store</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Navigasi Tombol */}
              <div className="flex justify-between pt-2">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Back
                  </button>
                )}
                <div className="flex space-x-2">
                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Create Product
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menampilkan semua produk dalam format kartu */}
      <h2 className="text-xl font-semibold mt-8">All Products</h2>
      {products.length === 0 ? (
        <p>No products found. You can create one.</p>
      ) : (
        <ul className="space-y-5 mt-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="border border-gray-300 rounded-lg p-4"
            >
              <Image
                src={product.imagePreview[0].imageUrl}
                alt={product.name}
                width={250}
                height={250}
                className="mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="mt-2 text-gray-700">{product.description}</p>
              <p className="text-sm text-gray-600">
                <strong>Price:</strong> ${product.price}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Stock:</strong> {product.stock}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Category:</strong> {product.category.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
