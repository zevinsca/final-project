"use client";

import { useState, useEffect } from "react";
import MenuNavbarUser from "@/components/header/header-user/header";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

interface AddressDetail {
  id: string;
  userAddressId: string;
  storeAddressId: string | null;
  address: string;
  destination: string;
  destinationId: string;
  city: string;
  province: string;
  postalCode: string;
  createdAt: string;
}

interface UserAddress {
  id: string;
  userId: string;
  recipient: string;
  isPrimary: boolean;
  Address: AddressDetail[];
}

interface DestinationOption {
  label: string;
  city_name: string;
  province_name: string;
  zip_code: string;
}

interface DestinationOption {
  label: string;
  city_name: string;
  province_name: string;
  id: string;
  zip_code: string;
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );
  const [destinationOptions, setDestinationOptions] = useState<
    DestinationOption[]
  >([]);
  const [formData, setFormData] = useState({
    recipient: "",
    address: "",
    destination: "",
    city: "",
    province: "",
    postalCode: "",
    destinationId: "",
    isPrimary: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/addresses", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data);
      } else {
        setError(data.message || "Failed to fetch addresses.");
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Error fetching addresses.");
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
        setDestinationOptions(data);
      } else {
        console.error("Failed to fetch destinations:", data.message);
      }
    } catch (error) {
      console.error("Error fetching destination:", error);
    }
  };

  const setAsPrimary = async (userAddressId: string) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/addresses/${userAddressId}/set-primary`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Gagal mengatur primary address.");
        return;
      }
      await fetchAddresses();
    } catch (err) {
      console.error("Error setting primary address:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        await fetchAddresses();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal menghapus alamat.");
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  const handleSave = async () => {
    const endpoint =
      isEditing && selectedAddress
        ? `http://localhost:8000/api/v1/addresses/${selectedAddress.Address[0].id}`
        : "http://localhost:8000/api/v1/addresses";
    const method = isEditing ? "PUT" : "POST";
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchAddresses();
        setShowModal(false);
        setFormData({
          recipient: "",
          address: "",
          destination: "",
          city: "",
          province: "",
          postalCode: "",
          destinationId: "",
          isPrimary: false,
        });
        setSelectedAddress(null);
        setIsEditing(false);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save address");
      }
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <MenuNavbarUser>
      <main className="bg-[#f7f8fa] min-h-screen text-black flex justify-center">
        <div className="h-fit w-[90%] md:w-[60%] lg:w-[40%] bg-white p-6 rounded-lg shadow-lg border border-black">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-green-800">
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
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {isEditing ? "Edit Address" : "Add New Address"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <input
                type="text"
                placeholder="Recipient"
                value={formData.recipient}
                onChange={(e) =>
                  setFormData({ ...formData, recipient: e.target.value })
                }
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Destination"
                value={formData.destination}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, destination: value });
                  fetchDestinationSuggestions(value);
                }}
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              {destinationOptions.map((opt, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFormData({
                      ...formData,
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
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Province"
                value={formData.province}
                onChange={(e) =>
                  setFormData({ ...formData, province: e.target.value })
                }
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <label className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrimary: e.target.checked })
                  }
                />
                <span>Set as primary</span>
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAddress(null);
                    setIsEditing(false);
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MenuNavbarUser>
  );
}
