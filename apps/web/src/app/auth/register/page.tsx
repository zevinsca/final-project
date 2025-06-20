"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  phoneNumber: string;
};

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.error || {});
        setMessage(data.message || "Registration failed");
      } else {
        setMessage("");
        setShowSuccessModal(true);
        setForm({
          email: "",
          firstName: "",
          lastName: "",
          username: "",
          password: "",
          phoneNumber: "",
        });
      }
    } catch {
      setMessage("Something went wrong.");
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push("/");
  };

  return (
    <>
      <div className="max-w-md mx-auto p-6 mt-16 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(
            [
              "email",
              "firstName",
              "lastName",
              "username",
              "password",
              "phoneNumber",
            ] as (keyof FormData)[]
          ).map((field) => (
            <div key={field}>
              <label
                htmlFor={field}
                className="block mb-1 font-medium capitalize text-gray-700"
              >
                {field}
              </label>
              <input
                id={field}
                type={field === "password" ? "password" : "text"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
                placeholder={`Enter your ${field}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-md
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                hover:scale-105 hover:shadow-md transition transform duration-300"
              />
              {errors[field] && (
                <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-md
            hover:bg-indigo-700 hover:scale-105 hover:shadow-lg transition transform duration-300
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}
      </div>

      {/* Modal sukses */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm text-center">
            <h3 className="text-xl font-semibold mb-4 text-green-600">
              Registration Successful!
            </h3>
            <p className="mb-6">Thank you for registering.</p>
            <button
              onClick={handleCloseModal}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
