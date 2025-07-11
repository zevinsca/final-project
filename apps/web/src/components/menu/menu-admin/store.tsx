"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CreateStoreSection from "./create-newstore";

// Tipe untuk Store
interface Store {
  id: string;
  name: string;
  address: string;
  destination: string;
  city: string;
  province: string;
  postalCode: string;
}

export default function StoreList() {
  const [stores, setStores] = useState<Store[]>([]); // Menyimpan daftar toko
  const [error, setError] = useState<string>(""); // Menyimpan pesan error

  // Mengambil data toko saat pertama kali dimuat
  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/stores/super-admin",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // untuk mengirimkan cookies
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch stores");
        }

        const data = await response.json();
        setStores(data.data); // Set data toko
      } catch (error) {
        console.log(error);
        setError("Gagal mengambil data toko.");
      }
    }

    fetchStores();
  }, []);

  // Fungsi untuk menghapus toko berdasarkan ID
  const handleDelete = async (storeId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/stores/super-admin/${storeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // untuk mengirimkan cookies
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete store");
      }

      // Menghapus toko dari state setelah berhasil dihapus
      setStores(stores.filter((store) => store.id !== storeId));
    } catch (error) {
      console.log(error);
      setError("Gagal menghapus toko.");
    }
  };

  // Menampilkan error jika ada masalah
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-xl text-red-500">{error}</span>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Store Management</h1>

      {/* Tombol untuk menambah toko */}
      <div className="text-center mb-6">
        <CreateStoreSection />
      </div>

      {/* Menampilkan daftar toko */}
      {stores.length > 0 ? (
        <ul className="space-y-4">
          {stores.map((store) => (
            <li
              key={store.id}
              className="border border-gray-300 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start bg-white shadow-md"
            >
              <div className="flex flex-col md:flex-row items-start">
                <h3 className="text-xl font-semibold">{store.name}</h3>
                <p className="text-gray-600">
                  {store.address}, {store.city},{store.province}
                </p>
                <p className="text-gray-500">{store.postalCode}</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-4">
                {/* Tautan untuk melihat detail toko */}
                <Link
                  href={`/dashboard/admin/store/${store.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  View Store
                </Link>
                {/* Tombol untuk menghapus toko */}
                <button
                  onClick={() => handleDelete(store.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete Store
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No stores available.</p>
      )}
    </div>
  );
}
