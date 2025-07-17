"use client";

import { useEffect, useState } from "react";
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

export default function ProductPage() {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGeoActive, setIsGeoActive] = useState<boolean>(false);

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);

  // ✅ NEW: Filter by category
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);

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

        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (category) params.append("category", category);
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        let url = "";

        if (isGeoActive && latitude !== null && longitude !== null) {
          params.append("latitude", latitude.toString());
          params.append("longitude", longitude.toString());
          params.append("radius", "20000");
          url = `${domain}/api/v1/products/nearby?${params.toString()}`;
        } else if (selectedProvince !== "All") {
          params.append("province", selectedProvince);
          url = `${domain}/api/v1/products/by-province?${params.toString()}`;
        } else {
          params.append("storeId", DEFAULT_STORE_ID);
          url = `${domain}/api/v1/products/by-store?${params.toString()}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Gagal memuat produk.");
        }

        const data = await res.json();
        const rawData = data.data ?? data.products ?? [];

        const normalized: Product[] = rawData.map(
          (item: Product | StoreProductResponse) =>
            "Product" in item ? { ...item.Product, stock: item.stock } : item
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
  }, [
    latitude,
    longitude,
    selectedProvince,
    isGeoActive,
    search,
    page,
    limit,
    category,
  ]);

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

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${domain}/api/v1/categories`);
        const data = await res.json();
        console.log("Fetched categories:", data);

        // Ambil array nama kategori dari data.data
        const names = (data.data || []).map((c: { name: string }) => c.name);
        setCategories(names);
      } catch (err) {
        console.error("Gagal mengambil kategori", err);
      }
    };

    fetchProvinces();
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen px-6 md:px-20 lg:px-40 py-10 grid grid-rows-[auto_1fr] gap-10">
      <div>{error && <p className="text-red-400 text-center">{error}</p>}</div>
      <div className="grid grid-rows-[auto_1fr] gap-5">
        {!isGeoActive && (
          <div className="w-full flex justify-end px-5">
            <div className="flex items-center gap-2 bg-green-700 text-white px-6 py-2 rounded shadow-md opacity-0">
              <span className="font-semibold">Pilih Lokasi</span>
              <select
                className="border-none rounded-md px-3 py-2 text-black cursor-pointer shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setPage(1);
                }}
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

        <div className="p-6 rounded-lg shadow-l grid grid-rows-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-900"></h2>

            <div className="flex flex-wrap gap-4 mb-6 items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border rounded shadow"
              />
              <button
                onClick={() => setPage(1)}
                className="bg-green-700 text-white px-4 py-2 rounded shadow"
              >
                Search
              </button>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="border rounded px-3 py-2 shadow"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {isGeoActive && stores.length > 0 && (
              <div className="mb-2 text-green-900 font-semibold">
                <strong>Toko terdekat:</strong> {stores.join(", ")}
              </div>
            )}

            {products.length === 0 && (
              <p className="text-green-600">Belum ada produk yang ditemukan.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-300 rounded-lg p-4 shadow hover:shadow-lg transition duration-300 text-center"
                >
                  <Image
                    src={
                      product.imagePreview?.[0]?.imageUrl ?? "/placeholder.jpg"
                    }
                    alt={product.name}
                    width={150}
                    height={150}
                    className="mx-auto mb-4"
                  />

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {product.name}
                  </h3>

                  <p className="text-green-700 font-bold mb-4">
                    Rp{product.price.toLocaleString()}
                  </p>

                  <Link
                    href={`/products/${product.id}`}
                    className="inline-block bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 transition"
                  >
                    View Product
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8 gap-3">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-green-700 text-white rounded shadow"
              >
                Prev
              </button>
              <span className="px-4 py-2 border rounded shadow">
                Page {page}
              </span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 bg-green-700 text-white rounded shadow"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
