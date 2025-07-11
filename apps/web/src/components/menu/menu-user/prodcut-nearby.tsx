"use client";

import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface Store {
  name: string;
}

interface NearbyResponse {
  products: Product[];
  nearbyStores: string[];
  message?: string;
}

export default function NearbyProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung oleh browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const radius = 7000;

        try {
          const res = await fetch(
            `http://localhost:8000/api/v1/products/nearby?latitude=${lat}&longitude=${lon}&radius=${radius}`
          );

          if (!res.ok) {
            const errBody = await res.json();
            throw new Error(
              errBody?.message ?? "Gagal mengambil data dari server."
            );
          }

          const data: NearbyResponse = await res.json();

          setProducts(data.products ?? []);
          setStores(data.nearbyStores ?? []);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Terjadi kesalahan saat mengambil data.");
          }
        }
      },
      () => {
        setError("Gagal mendapatkan lokasi pengguna.");
      }
    );
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Produk dari Toko Terdekat</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {stores.length > 0 && (
        <div className="mb-2">
          <strong>Toko terdekat:</strong> {stores.join(", ")}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded shadow">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600">{product.description}</p>
            <p className="mt-2 font-bold">
              Rp {product.price.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Stok: {product.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
