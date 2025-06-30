"use client";
import Image from "next/image";

export default function ShopSection() {
  const products = [
    {
      id: 1,
      image: "/images/eggs.png",
      label: "Best Deals",
      name: "Accusantium",
      oldPrice: "$50.00",
      price: "$45.00",
    },
    {
      id: 2,
      image: "/images/juice.png",
      label: "Organic",
      name: "Assumenda est",
      oldPrice: "",
      price: "$150.00",
    },
    {
      id: 3,
      image: "/images/limes.png",
      label: "Best Deals",
      name: "assumenda est, omnis",
      oldPrice: "$70.00",
      price: "$65.00",
    },
    {
      id: 4,
      image: "/images/tomatoes.png",
      label: "Organic",
      name: "Bath & Handwash",
      oldPrice: "",
      price: "$45.00",
    },
    {
      id: 5,
      image: "/images/vegetables.png",
      label: "Juices",
      name: "Fresh Vegetables",
      oldPrice: "",
      price: "$99.00",
    },
    {
      id: 6,
      image: "/images/peas.png",
      label: "Best Deals",
      name: "Green Peas",
      oldPrice: "$20.00",
      price: "$15.00",
    },
    {
      id: 7,
      image: "/images/zucchini.png",
      label: "Juices",
      name: "Zucchini",
      oldPrice: "",
      price: "$25.00",
    },
    {
      id: 8,
      image: "/images/pineapple.png",
      label: "Juices",
      name: "Pineapple",
      oldPrice: "$30.00",
      price: "$25.00",
    },
  ];

  return (
    <section className="max-w-[1200px] mx-auto py-12 px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shop</h1>
        <p className="text-gray-500">Home / Shop</p>
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Showing 1–{products.length} of {products.length} results
        </p>
        <select className="border border-gray-300 rounded px-3 py-2">
          <option>Default sorting</option>
          <option>Sort by price</option>
          <option>Sort by popularity</option>
        </select>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-lg shadow text-center relative"
          >
            {/* Sale badge */}
            {product.oldPrice && (
              <span className="absolute top-3 left-3 bg-green-700 text-white text-xs px-2 py-1 rounded">
                Sale
              </span>
            )}

            {/* Image */}
            <Image
              src={product.image}
              alt={product.name}
              width={150}
              height={150}
              className="mx-auto mb-4"
            />

            {/* Category */}
            <p className="text-gray-400 text-sm">{product.label}</p>

            {/* Name */}
            <p className="font-semibold mb-1">{product.name}</p>

            {/* Price */}
            <div className="mb-2">
              {product.oldPrice && (
                <span className="text-gray-400 line-through mr-2">
                  {product.oldPrice}
                </span>
              )}
              <span className="text-green-700 font-bold">{product.price}</span>
            </div>

            {/* Button */}
            <button className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 transition">
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
