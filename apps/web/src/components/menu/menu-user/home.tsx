"use client";

import { useEffect, useState } from "react";

import Icons from "./icons";
import Image from "next/image";
import Link from "next/link";
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imagePreview: { imageUrl: string }[];
  storeName?: string | null;
}

interface Store {
  name: string;
}

interface StoreProductResponse {
  Product: Product;
  Store: Store;
  stock: number;
}
const domain = process.env.NEXT_PUBLIC_DOMAIN;
const DEFAULT_STORE_ID = "f96bdf49-a653-44f9-bcb8-39432ff738c1";

export default function HomePageUser() {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGeoActive, setIsGeoActive] = useState<boolean>(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setIsGeoActive(true);
        },
        () => {
          setIsGeoActive(false);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (isGeoActive && (latitude === null || longitude === null)) return;

        let url = "";

        if (isGeoActive && latitude !== null && longitude !== null) {
          url = `${domain}/api/v1/products/nearby?latitude=${latitude}&longitude=${longitude}&radius=20000`;
        } else if (selectedProvince !== "All") {
          url = `${domain}/api/v1/products/by-province?province=${selectedProvince}`;
        } else {
          url = `${domain}/api/v1/products/by-store?storeId=${DEFAULT_STORE_ID}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Gagal memuat produk.");
        }

        const data = await res.json();
        const rawData = data.data ?? data.products ?? [];

        const normalized: Product[] = rawData.map(
          (item: Product | StoreProductResponse) =>
            "Product" in item
              ? { ...item.Product, stock: item.stock } // inject stock dari StoreProduct
              : item
        );

        const nearbyStoreNames: string[] = (data.nearbyStores ?? []).map(
          (store: { name: string }) => store.name
        );

        setProducts(normalized);
        setStores(nearbyStoreNames);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchProducts();
  }, [latitude, longitude, selectedProvince, isGeoActive]);

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
        <h1 className="text-3xl font-bold text-center">
          Selamat Datang di Market Snap
        </h1>

        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>
      <div className="grid grid-rows-[auto_1fr] gap-5">
        {!isGeoActive && (
          <div className="w-full flex justify-end px-5">
            <div className="flex items-center gap-2 bg-green-700 text-white px-6 py-2 rounded shadow-md opacity-0">
              <span className="font-semibold">Lokasi</span>
              <select
                className="border-none rounded-md px-3 py-2 text-black cursor-pointer shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value="" disabled hidden>
                  Pilih Provinsi
                </option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="p-6 rounded-lg shadow-l flex flex-col gap-20">
          <Icons />
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-900">
              Produk dari Toko
            </h2>

            {isGeoActive && stores.length > 0 && (
              <div className="mb-2 text-xl text-green-900 font-semibold">
                <strong>Toko terdekat:</strong> {stores.join(", ")}
              </div>
            )}

            {products.length === 0 && (
              <p className="text-green-600">Belum ada produk yang ditemukan.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border rounded-lg shadow hover:shadow-lg transition-transform transform hover:scale-105 p-4"
                >
                  <Image
                    src={product.imagePreview?.[0]?.imageUrl ?? "/default.jpg"}
                    alt={product.name}
                    width={250}
                    height={250}
                    className="mx-auto mb-4 rounded"
                  />

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                    {product.name}
                  </h3>

                  <p className="text-xl font-bold text-green-700 text-center mb-2">
                    Rp {product.price.toLocaleString()}
                  </p>

                  <p className="text-sm text-gray-600 text-center mb-4">
                    Stok: {product.stock}
                  </p>

                  <Link
                    href={`/products/${product.id}`}
                    className="block w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    View product
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
