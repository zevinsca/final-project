"use client";

import React, { useState } from "react";
import { FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { FaTwitter } from "react-icons/fa";
import GoogleSignInButton from "@/components/google-login/google-sign-in-button";

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <main>
      <button onClick={() => setShowLogin(!showLogin)}>
        <FiUser size={20} />
        {showLogin && (
          <div className="absolute top-20 right-4 w-72 bg-white text-black shadow-xl rounded-md z-50">
            <div className="flex bg-gray-100 rounded-t-md">
              <button className="flex-1 py-2 text-green-700 font-bold bg-white rounded-tl-md">
                Login
              </button>
              <button className="flex-1 py-2 text-gray-400">Sign Up</button>
            </div>
            <form className="p-4">
              <label className="text-red-500 text-xs">*</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full border rounded-md px-3 py-2 mt-1 mb-4"
              />
              <label className="text-red-500 text-xs">*</label>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full border rounded-md px-3 py-2 pr-10"
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
                <input type="checkbox" />{" "}
                <span className="text-sm">Remember me</span>
              </div>
              <button className="w-full bg-green-700 text-white py-2 rounded">
                Log in
              </button>
            </form>
            <div className="social-icons flex justify-center gap-4">
              <GoogleSignInButton />

              <button
                aria-label="Log in with Twitter"
                className="icon bg-white p-2 rounded-full hover:shadow-lg text-blue-500"
              >
                <FaTwitter size={24} />
              </button>
            </div>
          </div>
        )}
      </button>
    </main>
  );
}
