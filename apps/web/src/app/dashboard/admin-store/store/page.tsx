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

  if (loading) return <p>Loading...</p>;

  return (
    <MenuNavbarStoreAdmin>
      <h1 className="text-2xl font-bold mb-4">My Stores</h1>

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
    </MenuNavbarStoreAdmin>
  );
}
