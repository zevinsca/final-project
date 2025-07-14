"use client";
// import Image from "next/image";
// import StoreHomePage from "./store-homePage";
// import ProductNearby from "./nearby-product";

import { useEffect, useState } from "react";
// import { FiMenu } from "react-icons/fi";
// import Icons from "./icons";
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

export default function ProductPage() {
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
          url = `http://localhost:8000/api/v1/products/nearby?latitude=${latitude}&longitude=${longitude}&radius=7000`;
        } else if (selectedProvince !== "All") {
          url = `http://localhost:8000/api/v1/products/by-province?province=${selectedProvince}`;
        } else {
          url = `http://localhost:8000/api/v1/products`;
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
      <div>{error && <p className="text-red-400 text-center">{error}</p>}</div>
      <div className="grid grid-rows-[auto_1fr] gap-5">
        {!isGeoActive && (
          <div className="w-full flex justify-end px-5">
            <div className="flex items-center gap-2 bg-green-700 text-white px-6 py-2 rounded shadow-md">
              <span className="font-semibold">Pilih Lokasi</span>
              <select
                className="border border-gray-300 rounded px-3 py-2 text-black"
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                }}
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
        {/* <StoreHomePage /> */}
        <div className="p-6 rounded-lg shadow-l grid grid-rows-2 gap-20">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-900"></h2>

            {isGeoActive && stores.length > 0 && (
              <div className="mb-2 text-green-900 font-semibold">
                <strong></strong> {stores.join(", ")}
              </div>
            )}

            {products.length === 0 && (
              <p className="text-green-100">Belum ada produk yang ditemukan.</p>
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

                  {/* <p
                    className={`text-sm mb-2 ${
                      (product.stock ?? 0 > 0)
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {(product.stock ?? 0 > 0)
                      ? `Stok: ${product.stock}`
                      : "Out of Stock"}
                  </p> */}

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
          </div>
        </div>
      </div>
    </div>
  );
}
