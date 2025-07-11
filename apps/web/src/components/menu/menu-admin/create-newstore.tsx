"use client";

import { useState } from "react";

interface DestinationOption {
  label: string;
  city_name: string;
  province_name: string;
  zip_code: string;
}

export default function CreateStoreSection() {
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [destinationOptions, setDestinationOptions] = useState<
    DestinationOption[]
  >([]);
  const [newStore, setNewStore] = useState({
    name: "",
    address: "",
    destination: "",
    city: "",
    province: "",
    postalCode: "",
    latitude: latitude,
    longitude: longitude,
    isPrimary: false,
  });

  // Handler untuk submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error message
    setSuccess(""); // Reset success message

    // Validasi latitude dan longitude
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError("Latitude and Longitude must be within valid ranges.");
      return;
    }

    const updatedStore = { ...newStore, latitude, longitude };

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/stores/super-admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedStore),
          credentials: "include",
        }
      );

      if (response.ok) {
        const addedAddress = await response.json();
        console.log("🚀 Added Address:", addedAddress);

        // Reset form dan tutup modal setelah berhasil
        setNewStore({
          name: "",
          address: "",
          destination: "",
          city: "",
          province: "",
          postalCode: "",
          latitude: 0,
          longitude: 0,
          isPrimary: false,
        });
        setShowModal(false);
        setSuccess("Toko berhasil dibuat!");
      } else {
        setError("Gagal membuat toko. Pastikan semua data sudah benar.");
      }
    } catch (error) {
      console.error(error);
      setError("Gagal membuat toko. Pastikan semua data sudah benar.");
    }
  };

  // Fungsi untuk membuka modal
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Fetch destinasi berdasarkan keyword yang dimasukkan
  const fetchDestinationSuggestions = async (keyword: string) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/rajaongkir/search?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();

      if (res.ok) {
        setDestinationOptions(data); // Simpan destinasi yang ditemukan
      } else {
        console.error("Failed to fetch destinations:", data.message);
      }
    } catch (error) {
      console.error("Error fetching destination:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Create New Store
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500/50 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-4">Create Store</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Store Name
                </label>
                <input
                  type="text"
                  value={newStore.name}
                  onChange={(e) =>
                    setNewStore({
                      ...newStore,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={newStore.address}
                  onChange={(e) =>
                    setNewStore({
                      ...newStore,
                      address: e.target.value,
                    })
                  }
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Destination */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Destination
                </label>
                <input
                  type="text"
                  value={newStore.destination || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewStore({ ...newStore, destination: value });
                    fetchDestinationSuggestions(value); // fetch suggestion saat user ketik
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                {/* Display suggestions */}
                {destinationOptions.map((opt, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setNewStore({
                        ...newStore,
                        destination: opt.label,
                        city: opt.city_name,
                        province: opt.province_name,
                        postalCode: opt.zip_code,
                      });
                      setDestinationOptions([]);
                    }}
                  >
                    {opt.label}
                  </li>
                ))}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  value={newStore.city}
                  onChange={(e) =>
                    setNewStore({ ...newStore, city: e.target.value })
                  }
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Province
                </label>
                <input
                  type="text"
                  value={newStore.province}
                  onChange={(e) =>
                    setNewStore({ ...newStore, province: e.target.value })
                  }
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={newStore.postalCode}
                  onChange={(e) =>
                    setNewStore({
                      ...newStore,
                      postalCode: e.target.value,
                    })
                  }
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Latitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Latitude
                </label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Longitude
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Create Store
              </button>
            </form>

            {/* Error or Success Messages */}
            {error && <div className="mt-4 text-red-500">{error}</div>}
            {success && <div className="mt-4 text-green-500">{success}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
