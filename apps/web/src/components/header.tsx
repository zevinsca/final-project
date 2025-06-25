import Image from "next/image";
import { FiSearch, FiHeart, FiShoppingBag } from "react-icons/fi";

import LoginPageSection from "@/components/login/login";

export default function HeaderSection() {
  return (
    <section>
      <div className="bg-green-800 text-white text-center text-sm py-1">
        Welcome to Organic Shop drag
      </div>

      {/* Navbar */}
      <div className="flex justify-between items-center p-4 bg-green-900 text-white relative">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Organic Food" width={40} height={40} />
          <span className="text-xl font-bold">ORGANIC FOODS</span>
        </div>

        <div className="flex-1 mx-6">
          <div className="flex bg-white rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Search..."
              className="flex-grow px-4 py-2 text-black outline-none"
            />
            <button className="bg-black px-4">
              <FiSearch className="text-white" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <FiHeart size={20} />
          <LoginPageSection />
          <FiShoppingBag size={20} />
        </div>

        {/* Login Dropdown */}
      </div>
    </section>
  );
}
