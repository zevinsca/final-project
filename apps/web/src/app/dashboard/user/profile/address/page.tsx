"use client";

import { useState, useEffect } from "react";
import MenuNavbarUser from "@/components/header/header-user/header";
import Link from "next/link";

interface Address {
  id: string;
  recipient: string;
  address: string;
  destination: string;
  destinationId: string;
  city: string;
  province: string;
  postalCode: string;
  isPrimary: boolean;
}

interface UserAddress {
  id: string;
  userId: string;
  recipient: string;
  isPrimary: boolean;
  addressId: string;
  Address: Address; // ← this includes the full address object
}

interface DestinationOption {
  label: string;
  city_name: string;
  province_name: string;
  id: string;
  zip_code: string;
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [destinationOptions, setDestinationOptions] = useState<
    DestinationOption[]
  >([]);
  const [newAddress, setNewAddress] = useState({
    recipient: "",
    address: "",
    destination: "",
    city: "",
    province: "",
    postalCode: "",
    destinationId: "",
    isPrimary: false,
  });

  // ✅ Reusable function to fetch addresses
  const fetchAddresses = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/addresses", {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setAddresses(data); // ✅ Must return array of Address
      } else {
        setError(data.message || "Failed to fetch addresses.");
      }
    } catch (error) {
      setError("Error fetching addresses.");
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinationSuggestions = async (keyword: string) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/rajaongkir/search?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();

      if (res.ok) {
        setDestinationOptions(data); // misalnya array destinasi
      } else {
        console.error("Failed to fetch destinations:", data.message);
      }
    } catch (error) {
      console.error("Error fetching destination:", error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddNewAddress = () => {
    setIsAddingAddress(true);
  };

  const handleCloseForm = () => {
    setIsAddingAddress(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/v1/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddress),
        credentials: "include",
      });

      if (response.ok) {
        const addedAddress = await response.json();
        console.log("🚀 Added Address:", addedAddress);

        // Reset form
        setNewAddress({
          recipient: "",
          address: "",
          destination: "",
          city: "",
          province: "",
          postalCode: "",
          destinationId: "",
          isPrimary: false,
        });

        setIsAddingAddress(false);

        // ✅ Refresh address list from backend
        await fetchAddresses();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to add address.");
      }
    } catch (error) {
      setError("Error adding address.");
      console.error("Error adding address:", error);
    }
  };

  if (loading) return <p className="text-center">Loading addresses...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <MenuNavbarUser>
      <div>
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

        <main className="bg-[#f7f8fa] min-h-screen text-black flex justify-center">
          <div className="h-fit w-[40%] bg-white p-6 rounded-lg shadow-lg border border-black">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Your Addresses
            </h1>

            <div>
              {addresses.length === 0 ? (
                <p className="text-center">No addresses available.</p>
              ) : (
                <ul className="space-y-4">
                  {addresses.map((address) => (
                    <li
                      key={address.id}
                      className={`p-4 bg-white text-green-700 border border-green-700 rounded-lg ${
                        address.isPrimary ? "bg-green-100" : ""
                      }`}
                    >
                      <p className="font-semibold">{address.recipient}</p>
                      <p>{address.Address.address}</p>
                      <p>
                        {address.Address.city}, {address.Address.province},{" "}
                        {address.Address.postalCode}
                      </p>
                      <p className="text-sm">
                        {address.isPrimary
                          ? "Primary Address"
                          : "Secondary Address"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 text-center">
              {!isAddingAddress && (
                <button
                  onClick={handleAddNewAddress}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Add New Address
                </button>
              )}
            </div>
          </div>

          {isAddingAddress && (
            <div className="fixed inset-0 bg-gray-600/10 bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
              <div className="bg-white p-8 rounded-lg shadow-lg w-[40%]">
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Add New Address
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                      Recipient
                    </label>
                    <input
                      type="text"
                      value={newAddress.recipient}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          recipient: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                      Address Line
                    </label>
                    <input
                      type="text"
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          address: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                      Destination
                    </label>
                    <input
                      type="text"
                      value={newAddress.destination || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewAddress({ ...newAddress, destination: value });
                        fetchDestinationSuggestions(value); // fetch suggestion saat user ketik
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                    {/* Optional: tampilkan list suggestion */}
                    {destinationOptions.length > 0 && (
                      <ul className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto mt-2 bg-white shadow-md z-10 relative">
                        {destinationOptions.map((opt, index) => (
                          <li
                            key={index}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setNewAddress({
                                ...newAddress,

                                destination: opt.label,
                                city: opt.city_name,
                                province: opt.province_name,
                                postalCode: opt.zip_code,
                                destinationId: opt.id,
                              });
                              setDestinationOptions([]);
                            }}
                          >
                            {opt.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                      City
                    </label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                      Province
                    </label>
                    <input
                      type="text"
                      value={newAddress.province}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          province: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={newAddress.postalCode}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          postalCode: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                      Destination ID
                    </label>
                    <input
                      type="text"
                      value={newAddress.destinationId}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          destinationId: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={newAddress.isPrimary}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          isPrimary: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <label className="text-sm">Set as Primary Address</label>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="bg-red-600 text-white px-4 py-2 rounded ml-4"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </MenuNavbarUser>
  );
}
