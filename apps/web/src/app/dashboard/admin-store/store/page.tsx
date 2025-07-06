"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MenuNavbarStoreAdmin from "@/components/header/header-admin-store/header-admin-store";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export default function StorePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/stores", {
          withCredentials: true,
        });
        setStores(res.data.data);
      } catch (err) {
        console.error("Error fetching stores:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/api/v1/stores",
        {
          name,
          address,
          city,
          province,
          postalCode,
        },
        { withCredentials: true }
      );

      setShowModal(false);
      const res = await axios.get("http://localhost:8000/api/v1/stores", {
        withCredentials: true,
      });
      setStores(res.data.data);

      setName("");
      setAddress("");
      setCity("");
      setProvince("");
      setPostalCode("");
    } catch (error) {
      console.error("Error creating store:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <MenuNavbarStoreAdmin>
      <h1 className="text-2xl font-bold mb-4">My Stores</h1>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6"
      >
        Create New Store
      </button>

      {stores.length === 0 ? (
        <p>No stores found. You can create one.</p>
      ) : (
        <ul className="space-y-5">
          {stores.map((store) => (
            <li
              key={store.id}
              className="border border-gray-300 rounded-lg p-4"
            >
              <h2 className="text-xl font-semibold">
                <Link href={`/dashboard/admin-store/store/${store.id}`}>
                  {store.name}
                </Link>
              </h2>
              {store.address && (
                <p className="mt-1 text-gray-700">
                  <span className="font-medium">Address:</span> {store.address},{" "}
                  {store.city}, {store.province}, {store.postalCode}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/90 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Create New Store</h2>

            <form onSubmit={handleCreateStore} className="space-y-3">
              <input
                type="text"
                placeholder="Store Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Address Line"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MenuNavbarStoreAdmin>
  );
}
