"use client";

import { useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);

  // Fungsi ini akan dijalankan saat login berhasil menggunakan Google
  function onSignIn(googleUser) {
    const id_token = googleUser.getAuthResponse().id_token;

    // Kirim token ke backend untuk verifikasi
    fetch("http://localhost:8000/api/v1/auth/login/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: id_token }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("User info:", data);
        setUser(data.user); // Menyimpan informasi user ke state
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Fungsi untuk menangani logout
  const handleLogout = () => {
    fetch("http://localhost:8000/api/v1/auth/logout", {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Logged out", data);
        setUser(null); // Clear user state
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  };

  return (
    <header
      style={{
        padding: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h1>My App</h1>
      </div>
      <div>
        {user ? (
          <div>
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="g-signin2" data-onsuccess="onSignIn"></div>
        )}
      </div>
    </header>
  );
}
