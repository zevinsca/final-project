"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";

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

  // Ambil data user
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

  // Fungsi untuk kirim ulang email verifikasi
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
    <div>
      {/* Navigasi */}
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 px-10 justify-center">
        <div className="grid grid-cols-2 items-center justify-center space-x-4 text-center">
          <Link
            href="/dashboard/user/profile"
            className="hover:text-green-900 bg-green-600 text-white px-4 py-2 rounded"
          >
            Profile
          </Link>
          <Link
            href="/dashboard/user/profile/address"
            className="hover:text-green-900 bg-green-600 text-white px-4 py-2 rounded"
          >
            Address
          </Link>
        </div>
      </div>

      {/* Info User */}
      <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-gradient-to-tr from-teal-500 to-green-900 rounded-full p-4 shadow-md">
            <FaUser size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-center">
            {user.firstname} {user.lastname}
          </h2>
          <p className="text-gray-500">@{user.username}</p>
        </div>

        {/* Status Email */}
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{user.email}</p>

            <p className="text-sm mt-1">
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
                    <p className="text-sm mt-1 text-gray-700">
                      {verifyMessage}
                    </p>
                  )}
                </div>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
