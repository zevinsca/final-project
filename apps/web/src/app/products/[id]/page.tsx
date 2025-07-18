"use client";
import MenuNavbarUser from "@/components/header/header-user/header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";

interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imagePreview: [{ imageUrl: string }];
  imageContent: [{ imageUrl: string }];
}

export default function ProductCatalogId({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  /* ----------------------------------------------------------------------------
   *  component state
   * --------------------------------------------------------------------------*/
  const [product, setProduct] = useState<ProductType | null>(null);
  const [qty, setQty] = useState<number>(1);

  const [notification, setNotification] = useState<string | null>(null);

  const router = useRouter();

  /* ----------------------------------------------------------------------------
   *  fetch product data once on mount
   * --------------------------------------------------------------------------*/
  useEffect(() => {
    let isMounted = true;

    async function getProduct() {
      try {
        const { id } = await params;

        const lat = localStorage.getItem("lat");
        const lng = localStorage.getItem("lng");
        const province = localStorage.getItem("province");

        let url = `http://localhost:8000/api/v1/products/${id}`;
        const query = new URLSearchParams();

        if (lat && lng) {
          query.append("lat", lat);
          query.append("lng", lng);
        } else if (province && province !== "All") {
          query.append("province", province);
        }

        if (query.toString()) {
          url += `?${query.toString()}`;
        }

        const res = await fetch(url, {
          credentials: "include",
        });
        const json = await res.json();
        const raw = json?.data;

        const storeProduct = (raw.StoreProduct ?? [])[0];
        const stock = storeProduct?.stock ?? 0;

        const normalized: ProductType = {
          id: raw.id,
          name: raw.name,
          description: raw.description,
          price: raw.price,
          imagePreview: raw.imagePreview ?? [],
          imageContent: raw.imageContent ?? [],
          stock,
        };

        if (isMounted) {
          setProduct(normalized);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    }

    getProduct();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------------------------------------------------------
   *  helpers
   * --------------------------------------------------------------------------*/
  const changeQty = (delta: number) => {
    if (!product) return;
    setQty((curr) => {
      const next = curr + delta;
      // clamp between 1 and available stock
      return Math.max(1, Math.min(next, product.stock));
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await fetch("http://localhost:8000/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      // Show success notification
      setNotification("✅ Successfully added to cart!");

      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart(); // add first…
    router.push("/checkout"); // …then jump straight to checkout
  };

  /* ----------------------------------------------------------------------------
   *  render
   * --------------------------------------------------------------------------*/
  return (
    <MenuNavbarUser>
      <div className="p-4 max-w-5xl mx-auto">
        {notification && (
          <div className="absolute top-0 left-0 right-0 bg-green-100 text-green-800 text-sm text-center p-2 shadow z-50">
            {notification}
          </div>
        )}

        {product && (
          <div className="flex flex-col md:flex-row gap-8 border rounded-lg shadow p-6 bg-white">
            {/* LEFT: Image */}
            <div className="flex justify-center md:w-1/2">
              <Image
                src={product.imagePreview?.[0]?.imageUrl ?? "/placeholder.jpg"}
                alt={product.name}
                width={300}
                height={300}
                className="rounded-lg border"
              />
            </div>

            {/* RIGHT: Details */}
            <div className="flex flex-col md:w-1/2 space-y-4">
              <h1 className="text-2xl font-bold text-green-800">
                {product.name}
              </h1>
              <p className="text-gray-700">{product.description}</p>

              <div className="space-y-1">
                {/* <p className="text-sm text-gray-400 line-through">
                  Rp {(product.price * 1.1).toLocaleString()}
                </p> */}
                <p className="text-2xl font-bold text-green-700">
                  Rp {product.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Available Stock: {product.stock}
                </p>
              </div>

              {/* quantity selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeQty(-1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={qty === 1}
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center">{qty}</span>
                <button
                  onClick={() => changeQty(1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={product.stock === 0 || qty === product.stock}
                >
                  +
                </button>
              </div>

              {/* action buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-50"
                  disabled={product.stock === 0}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MenuNavbarUser>
  );
}
