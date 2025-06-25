"use client";

import { FiLogOut } from "react-icons/fi";

export default function SignOut() {
  async function handleClick() {
    try {
      await fetch("http://localhost:8000/api/v1/auth/logout", {
        method: "DELETE",
        credentials: "include",
      });

      // Paksa reload halaman agar session/cookie diperbarui
      window.location.href = "/";
      // atau jika kamu ingin reload tanpa pindah halaman:
      // window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 transition text-white font-semibold shadow-md"
    >
      <FiLogOut size={18} />
      Sign Out
    </button>
  );
}
