"use client";
import { FiX } from "react-icons/fi";

export default function ShoppingBag({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-0 right-0 h-screen w-full md:w-[350px] bg-[#1f1f1f]/90 backdrop-blur-md text-white shadow-2xl transition-all duration-300 ease-in-out p-6 z-[100] rounded-l-xl ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Cart</h2>
        <button onClick={onClose}>
          <FiX size={24} />
        </button>
      </div>
      {/* Example content */}
      <p className="text-gray-300">Your shopping bag is empty.</p>
    </div>
  );
}
