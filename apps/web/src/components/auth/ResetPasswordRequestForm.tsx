"use client";

import { useState } from "react";

export default function ResetPasswordRequestForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan.");
      } else {
        setMessage(data.message || "Link reset berhasil dikirim.");
        setEmail("");
      }
    } catch (error) {
      console.error("Error sending reset password request:", error);
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-md rounded px-8 py-6 border">
      <h1 className="text-2xl font-bold mb-4 text-green-900 text-center">
        Reset Password
      </h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-green-900 text-white py-2 rounded hover:bg-green-800"
          disabled={loading}
        >
          {loading ? "Mengirim..." : "Kirim Link Reset"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {message && <p className="mt-4 text-green-700">{message}</p>}
    </div>
  );
}
