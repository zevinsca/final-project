"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SetNewPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/auth/set-new-password?token=${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, confirmPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan.");
      } else {
        setMessage(data.message || "Password berhasil diubah.");
        setPassword("");
        setConfirmPassword("");
        setSuccess(true);
      }
    } catch (error) {
      console.error("🛑 Error atur ulang password:", error);
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-green-900 relative">
        {success && (
          <div className="absolute inset-0 bg-green-900 bg-opacity-90 flex items-center justify-center text-white text-center p-6 rounded-xl z-10">
            <div>
              <h2 className="text-2xl font-bold mb-2">🎉 Berhasil!</h2>
              <p>Password Anda telah berhasil diperbarui.</p>
              <p className="text-sm mt-2">
                Anda dapat langsung login dengan password baru Anda.
              </p>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-green-900 mb-6 text-center">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-1">
              Password Baru
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-green-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-800"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-green-900 mb-1">
              Konfirmasi Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-green-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-900 text-white font-semibold py-2 rounded-md hover:bg-green-800 transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Reset Password"}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-100 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 text-sm text-green-800 bg-green-100 px-4 py-2 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
