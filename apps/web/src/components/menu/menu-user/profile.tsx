"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import AddressTab from "@/components/menu/menu-user/address-tab";

interface User {
  name: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  isVerified: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "address" | "orders">(
    "profile"
  );

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(
          "http://localhost:8000/api/v1/user/current-user",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setUser(data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleResendVerification = async () => {
    setVerifying(true);
    setVerifyMessage(null);

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/auth/verify-email",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();
      setVerifyMessage(data.message || "Email verifikasi telah dikirim.");
    } catch (error) {
      console.error("Error resending verification email:", error);
      setVerifyMessage("Gagal mengirim ulang email verifikasi.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Memuat data user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">Gagal memuat data pengguna.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row max-w-5xl mx-auto mt-10 space-x-0 md:space-x-6 space-y-6 md:space-y-0">
      {/* Sidebar Menu */}
      <div className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-semibold">Menu</h3>
        <div className="flex flex-col space-y-2">
          {/* <Link
            href="/dashboard/user/profile"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
          >
            Profile
          </Link>
          <Link
            href="/dashboard/user/profile/address"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
          >
            Address
          </Link>
          <Link
            href="/dashboard/user/orders"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
          >
            My Orders
          </Link> */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded text-center ${
              activeTab === "profile"
                ? "bg-green-700 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            Profile
          </button>

          <button
            onClick={() => setActiveTab("address")}
            className={`px-4 py-2 rounded text-center ${
              activeTab === "address"
                ? "bg-green-700 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            Address
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded text-center ${
              activeTab === "orders"
                ? "bg-green-700 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            My Orders
          </button>
        </div>
      </div>

      {/* Main Content */}
      {/* <div className="w-full md:w-3/4 bg-white shadow-lg rounded-lg p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-gradient-to-tr from-teal-500 to-green-900 rounded-full p-4 shadow-md">
            <FaUser size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-center">
            {user.firstname} {user.lastname}
          </h2>
          <p className="text-gray-500">@{user.username}</p>
        </div>

        
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{user.email}</p>

            {user.isVerified ? (
              <div className="mt-2">
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  ✅ Verified
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2 mt-2">
                <span className="text-red-600 font-semibold">
                  Belum Diverifikasi
                </span>
                <button
                  onClick={handleResendVerification}
                  className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
                  disabled={verifying}
                >
                  {verifying ? "Mengirim..." : "Verifikasi Akun"}
                </button>
                {verifyMessage && (
                  <p className="text-sm mt-1 text-gray-700">{verifyMessage}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div> */}
      <div className="w-full md:w-3/4 bg-white shadow-lg rounded-lg p-6">
        {activeTab === "profile" && (
          <div>
            {/* Existing Profile Content */}
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-tr from-teal-500 to-green-900 rounded-full p-4 shadow-md">
                <FaUser size={48} className="text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-center">
                {user.firstname} {user.lastname}
              </h2>
              <p className="text-gray-500">@{user.username}</p>
            </div>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium">{user.email}</p>
              {user.isVerified ? (
                <p className="text-green-600 font-semibold">✅ Verified</p>
              ) : (
                <div className="flex flex-col items-start gap-2 mt-2">
                  <span className="text-red-600 font-semibold">
                    Belum Diverifikasi
                  </span>
                  <button
                    onClick={handleResendVerification}
                    className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
                    disabled={verifying}
                  >
                    {verifying ? "Mengirim..." : "Verifikasi Akun"}
                  </button>
                  {verifyMessage && (
                    <p className="text-sm mt-1 text-gray-700">
                      {verifyMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "address" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Alamat Pengiriman</h2>
            <AddressTab />
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Orders</h2>
            <p>🧾 Show list of orders here (or import Orders component)</p>
          </div>
        )}
      </div>
    </div>
  );
}
