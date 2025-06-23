"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { FaTwitter } from "react-icons/fa";

export default function LoginPageSection() {
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);

  // ✅ Tutup popup jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowLogin(false);
      }
    }

    if (showLogin) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      console.log("Login success:", data);
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Login gagal!");
    }
  };

  return (
    <main className="relative">
      {/* Ganti button luar dengan div */}
      <div
        onClick={() => setShowLogin(!showLogin)}
        className="cursor-pointer flex items-center gap-2"
      >
        <FiUser size={20} />
        <p className="text-sm">Login</p>
      </div>

      {/* Login Popup */}
      {showLogin && (
        <div
          ref={popupRef}
          className="absolute top-12 right-0 w-72 bg-white text-black shadow-xl rounded-md z-50"
        >
          <div className="flex bg-gray-100 rounded-t-md">
            <button className="flex-1 py-2 text-green-700 font-bold bg-white rounded-tl-md">
              Login
            </button>
            <button className="flex-1 py-2 text-gray-400">Sign Up</button>
          </div>

          <form className="p-4" onSubmit={handleLogin}>
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1 mb-4"
              required
            />

            <label className="text-sm font-semibold">Password</label>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2.5 right-3 text-gray-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" className="text-sm">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-green-700 text-white py-2 rounded"
            >
              Log in
            </button>
          </form>

          <div className="social-icons flex flex-col gap-3 px-4 pb-4">
            <a
              href="http://localhost:8000/api/v1/auth/google"
              className="w-full text-center bg-white border py-2 rounded hover:shadow-md"
            >
              Log in with Google
            </a>

            <button
              aria-label="Log in with Twitter"
              className="w-full text-center bg-white border py-2 rounded text-blue-500 hover:shadow-md flex justify-center items-center gap-2"
            >
              <FaTwitter size={18} />
              Twitter
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
