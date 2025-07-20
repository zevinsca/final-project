"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import MenuNavbarStoreAdmin from "@/components/header/header-admin-store/header-admin-store";

interface Product {
  id: string;
  name: string;
}

interface Store {
  id: string;
  name: string;
}

export default function CreateDiscount() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [userStore, setUserStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    value: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    startDate: "",
    endDate: "",
  });

  // Fetch user store info first
  useEffect(() => {
    const fetchUserStore = async () => {
      try {
        console.log("🔄 Fetching user store...");
        const response = await fetch(
          "http://localhost:8000/api/v1/auth/profile",
          {
            credentials: "include",
          }
        );

        console.log("📋 Profile response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("👤 User data:", data);

          if (data.user?.Store && data.user.Store.length > 0) {
            setUserStore(data.user.Store[0]);
            console.log("🏪 User store set:", data.user.Store[0]);
          } else {
            console.warn("⚠️ No store found for user");
          }
        } else {
          console.error("❌ Failed to fetch profile:", response.statusText);
        }
      } catch (error) {
        console.error("🚨 Error fetching user store:", error);
      }
    };
    fetchUserStore();
  }, []);

  // Fetch products from current store only
  useEffect(() => {
    const fetchProducts = async () => {
      if (!userStore?.id) {
        console.log("⏳ Waiting for store ID...");
        return;
      }

      try {
        console.log("🔄 Fetching products for store:", userStore.id);
        const url = new URL("http://localhost:8000/api/v1/products/by-store");
        url.searchParams.append("storeId", userStore.id);

        console.log("🌐 Request URL:", url.toString());

        const response = await fetch(url.toString(), {
          credentials: "include",
        });

        console.log("📦 Products response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("📦 Products data:", data);
          setProducts(data.data || []);
        } else {
          console.error("❌ Failed to fetch products:", response.statusText);
        }
      } catch (error) {
        console.error("🚨 Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [userStore?.id]);

  // Validation function
  const validateForm = () => {
    console.log("🔍 Validating form:", form);
    console.log("🏪 User store:", userStore);

    if (!userStore?.id) {
      alert("Store information not loaded. Please refresh the page.");
      return false;
    }
    if (!form.productId) {
      alert("Please select a product");
      return false;
    }
    if (!form.value || parseFloat(form.value) <= 0) {
      alert("Please enter a valid discount value");
      return false;
    }
    if (form.discountType === "PERCENTAGE" && parseFloat(form.value) > 100) {
      alert("Percentage discount cannot exceed 100%");
      return false;
    }
    if (!form.startDate || !form.endDate) {
      alert("Please select start and end dates");
      return false;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      alert("End date must be after start date");
      return false;
    }
    if (new Date(form.startDate) < new Date()) {
      alert("Start date cannot be in the past");
      return false;
    }

    console.log("✅ Form validation passed");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    console.log("🚀 Starting discount creation...");

    try {
      // Try different date formats
      const startDateISO = new Date(form.startDate).toISOString();
      const endDateISO = new Date(form.endDate).toISOString();

      const requestData = {
        storeId: userStore?.id,
        productId: form.productId,
        value: parseFloat(form.value),
        discountType: form.discountType,
        startDate: startDateISO, // Send as ISO string
        endDate: endDateISO, // Send as ISO string
      };

      console.log("📤 Request data:", requestData);
      console.log("📅 Original form dates:", {
        start: form.startDate,
        end: form.endDate,
      });
      console.log("📅 ISO dates:", { start: startDateISO, end: endDateISO });
      console.log("📅 Start Date as Date object:", new Date(form.startDate));
      console.log("📅 End Date as Date object:", new Date(form.endDate));
      console.log("🕐 Current time:", new Date());
      console.log("⏰ Current timestamp:", Date.now());
      console.log("📅 Start timestamp:", new Date(form.startDate).getTime());
      console.log("📅 End timestamp:", new Date(form.endDate).getTime());

      console.log("📤 Request data:", requestData);
      console.log("🌐 Request URL: http://localhost:8000/api/v1/discounts");

      const response = await fetch("http://localhost:8000/api/v1/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      console.log("📥 Response status:", response.status);
      console.log(
        "📥 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Success response:", result);
        alert("Discount created successfully!");
        router.push("/dashboard/admin-store/discount");
      } else {
        // Get error details
        const errorText = await response.text();
        console.error("❌ Error response status:", response.status);
        console.error("❌ Error response body:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          console.error("❌ Parsed error data:", errorData);
          alert(
            `Failed to create discount: ${errorData.message || errorData.error || "Unknown error"}`
          );
        } catch {
          alert(
            `Failed to create discount (Status: ${response.status}): ${errorText}`
          );
        }
      }
    } catch (error) {
      console.error("🚨 Network/JS error:", error);
      alert(`Network error`);
    } finally {
      setLoading(false);
      console.log("🔄 Request completed");
    }
  };

  // Debug info display
  const debugInfo = (
    <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
      <h3 className="font-bold mb-2">🐛 Debug Info:</h3>
      <p>
        <strong>User Store:</strong>{" "}
        {userStore ? `${userStore.name} (${userStore.id})` : "Not loaded"}
      </p>
      <p>
        <strong>Products Count:</strong> {products.length}
      </p>
      <p>
        <strong>Form Valid:</strong>{" "}
        {form.productId && form.value && form.startDate && form.endDate
          ? "✅"
          : "❌"}
      </p>
    </div>
  );

  return (
    <MenuNavbarStoreAdmin>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Create New Discount</h1>
        </div>

        {/* Debug Info - Remove this in production */}
        {debugInfo}

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Product *
              </label>
              <select
                value={form.productId}
                onChange={(e) => {
                  console.log("🎯 Product selected:", e.target.value);
                  setForm({ ...form, productId: e.target.value });
                }}
                required
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {products.length === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  No products available. Please add products first.
                </p>
              )}
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select
                  value={form.discountType}
                  onChange={(e) => {
                    console.log("💰 Discount type changed:", e.target.value);
                    setForm({
                      ...form,
                      discountType: e.target.value as "PERCENTAGE" | "FIXED",
                    });
                  }}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (IDR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Value *
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => {
                    console.log("💲 Value changed:", e.target.value);
                    setForm({ ...form, value: e.target.value });
                  }}
                  required
                  min="0"
                  max={form.discountType === "PERCENTAGE" ? "100" : undefined}
                  step={form.discountType === "PERCENTAGE" ? "0.01" : "1000"}
                  placeholder={
                    form.discountType === "PERCENTAGE" ? "10" : "50000"
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => {
                    console.log("📅 Start date changed:", e.target.value);
                    setForm({ ...form, startDate: e.target.value });
                  }}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => {
                    console.log("📅 End date changed:", e.target.value);
                    setForm({ ...form, endDate: e.target.value });
                  }}
                  required
                  min={form.startDate || new Date().toISOString().slice(0, 16)}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || products.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Discount"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MenuNavbarStoreAdmin>
  );
}
