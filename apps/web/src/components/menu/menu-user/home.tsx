"use client";

import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import Icons from "./icons";

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

interface StoreProductResponse {
  Product: Product;
  Store: Store;
}

export default function HomePageUser() {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGeoActive, setIsGeoActive] = useState<boolean>(false);
  const [locationReady, setLocationReady] = useState<boolean>(false);

  // Ambil lokasi pengguna
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setIsGeoActive(true);
          setLocationReady(true);
        },
        () => {
          setIsGeoActive(false);
          setLocationReady(false);
        }
      );
    }
  }, []);

  // Fetch produk
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = "";

        if (
          isGeoActive &&
          locationReady &&
          latitude !== null &&
          longitude !== null
        ) {
          url = `http://localhost:8000/api/v1/products/nearby?latitude=${latitude}&longitude=${longitude}&radius=7000`;
        } else if (selectedProvince !== "All") {
          url = `http://localhost:8000/api/v1/products/by-province?province=${selectedProvince}`;
        } else {
          url = `http://localhost:8000/api/v1/products`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal memuat produk.");

        const data = await res.json();
        const rawData = data.data ?? data.products ?? [];

        const normalized: Product[] = rawData.map(
          (item: Product | StoreProductResponse) =>
            "Product" in item ? item.Product : item
        );

        const nearbyStoreNames: string[] = (data.nearbyStores ?? []).map(
          (store: { name: string }) => store.name
        );

        setProducts(normalized);
        setStores(nearbyStoreNames);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [latitude, longitude, selectedProvince, isGeoActive, locationReady]);

  // Fetch provinsi
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/v1/addresses/provinces"
        );
        const data = await res.json();
        setProvinces(data.provinces || []);
      } catch (err) {
        console.error("Gagal mengambil provinsi", err);
      }
    };

    fetchProvinces();
  }, []);

  return (
    <div className="min-h-screen px-6 md:px-20 lg:px-40 py-10 grid grid-rows-[auto_1fr] gap-10">
      <div>
        <h1 className="text-3xl font-bold text-center text-green-900 animate-fade-in-up">
          Selamat Datang di Market Snap
        </h1>
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>

      <div className="grid grid-rows-[auto_1fr] gap-5">
        {!isGeoActive && (
          <div className="w-full flex justify-end px-5">
            <div className="flex items-center gap-2 bg-green-700 text-white px-6 py-2 rounded shadow-md">
              <FiMenu />
              <span className="font-semibold">Pilih Lokasi</span>
              <select
                className="border border-gray-300 rounded px-3 py-2 text-black"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value="All">All</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="p-6 rounded-lg shadow-l grid grid-rows-2 gap-20">
          <Icons />

          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-900">
              Produk dari Toko
            </h2>

            {isGeoActive && stores.length > 0 && (
              <div className="mb-2 text-green-900 font-semibold">
                <strong>Toko terdekat:</strong> {stores.join(", ")}
              </div>
            )}

            {loading && (
              <p className="text-green-700 italic">Memuat produk terdekat...</p>
            )}

            {!loading && products.length === 0 && (
              <p className="text-green-500 italic">
                Belum ada produk yang ditemukan.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-green-900 text-white border border-green-700 p-4 rounded-lg shadow transition duration-300 transform hover:scale-105 hover:shadow-2xl hover:bg-green-800"
                >
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-green-200">{product.description}</p>
                  <p className="font-bold text-lime-300 pt-2">
                    Rp {product.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-300">
                    Stok: {product.stock}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
