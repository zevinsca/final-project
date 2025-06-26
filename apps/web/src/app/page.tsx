"use client";

import Link from "next/link";
import Image from "next/image";
import { FiMenu } from "react-icons/fi";

import HeaderSection from "@/components/header";

export default function HomePage() {
  return (
    <div className="bg-[#f7f8fa] min-h-screen text-black">
      {/* Top Welcome Bar */}

      {/* Navbar */}

      <HeaderSection />

      {/* Login Dropdown */}
      {/* Login Dropdown */}

      {/* Secondary Menu */}
      <div className="bg-white text-green-900 px-6 py-2 flex justify-between items-center shadow-md">
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded">
          <FiMenu /> All Categories
        </button>
        <nav className="flex gap-6">
          <Link href="#" className="hover:text-green-600">
            Home
          </Link>
          <Link href="#" className="hover:text-green-600">
            Best Deals
          </Link>
          <Link href="#" className="hover:text-green-600">
            About
          </Link>
          <Link href="#" className="hover:text-green-600">
            Contact Us
          </Link>
          <Link href="#" className="hover:text-green-600">
            Shop
          </Link>
        </nav>
        <div className="text-sm">📞 Call To +1800090098</div>
      </div>

      {/* Content Grid Section - Centered Layout */}
      <div className="grid grid-cols-[1fr_30%] px-40">
        <div className=" justify-center p-6">
          <div className="grid grid-rows-2 gap-5">
            <div className="">
              <div className="bg-green-800 rounded-xl p-6 text-white flex flex-col justify-center w-full h-full">
                <p className="italic text-sm">FARM FRESH</p>
                <h1 className="text-4xl font-bold mt-2 mb-4">
                  Organic & Healthy
                </h1>
                <p className="text-sm leading-relaxed">
                  Donec sed mauris non quam molestie imperdiet. Integer
                  ullamcorper, purus sit amet hendrerit tincidunt
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-orange-400 text-white rounded-xl p-6 flex flex-col items-center justify-center">
                <Image
                  src="/pineapple.png"
                  alt="Pineapple"
                  width={112}
                  height={112}
                  className="mb-4"
                />
                <h2 className="text-2xl font-bold">Healthy Juices</h2>
                <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-md shadow">
                  Shop Now
                </button>
              </div>

              <div className="bg-cyan-600 text-white rounded-xl p-6 flex flex-col items-center justify-center">
                <Image
                  src="/pineapple.png"
                  alt="Pineapple"
                  width={112}
                  height={112}
                  className="mb-4"
                />
                <h2 className="text-2xl font-bold">Farm Fresh</h2>
                <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-md shadow">
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="justify-center p-6 ">
          <div className="grid gap-y-5">
            <div className="bg-orange-400 text-white rounded-xl p-6 flex flex-col items-center justify-center">
              <Image
                src="/pineapple.png"
                alt="Pineapple"
                width={112}
                height={112}
                className="mb-4"
              />
              <h2 className="text-2xl font-bold">Organic Fruits</h2>
              <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-md shadow">
                Shop Now
              </button>
            </div>
            <div className="bg-orange-400 text-white rounded-xl p-6 flex flex-col items-center justify-center">
              <Image
                src="/pineapple.png"
                alt="Pineapple"
                width={112}
                height={112}
                className="mb-4"
              />
              <h2 className="text-2xl font-bold">Organic Fruits</h2>
              <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-md shadow">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
