import Image from "next/image";

export default function BestDealsSection() {
  return (
    <main className="bg-[#f7f8fa] min-h-screen text-black">
      <div className="bg-gray-50 w-full py-8">
        <div className="max-w-[1400px] mx-auto px-8">
          <h1 className="text-3xl font-bold mb-6">Best Deals</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Product Card 1 */}
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
              <Image
                src="/images/tomato.png"
                alt="Tomato"
                width={150}
                height={150}
                className="mb-4"
              />
              <p className="text-xl font-bold">Fresh Tomatoes</p>
              <p className="text-green-600">-40%</p>
              <p className="text-xl font-semibold">$40.00 - $300.00</p>
              <button className="bg-green-600 text-white mt-4 px-5 py-2 rounded-md">
                Select Options
              </button>
            </div>
            {/* Product Card 2 */}
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
              <Image
                src="/images/juice.png"
                alt="Juice"
                width={150}
                height={150}
                className="mb-4"
              />
              <p className="text-xl font-bold">Healthy Juice</p>
              <p className="text-red-600">-48%</p>
              <p className="text-xl font-semibold">$49.00 - $199.00</p>
              <button className="bg-green-600 text-white mt-4 px-5 py-2 rounded-md">
                Select Options
              </button>
            </div>
            {/* Product Card 3 */}
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
              <Image
                src="/images/bread.png"
                alt="Bread"
                width={150}
                height={150}
                className="mb-4"
              />
              <p className="text-xl font-bold">Organic Bread</p>
              <p className="text-yellow-600">-50%</p>
              <p className="text-xl font-semibold">$88.00 - $99.00</p>
              <button className="bg-green-600 text-white mt-4 px-5 py-2 rounded-md">
                Select Options
              </button>
            </div>
            {/* Product Card 4 */}
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
              <Image
                src="/images/tomato.png"
                alt="Tomato"
                width={150}
                height={150}
                className="mb-4"
              />
              <p className="text-xl font-bold">Red Tomato Pack</p>
              <p className="text-green-600">-30%</p>
              <p className="text-xl font-semibold">$60.00</p>
              <button className="bg-green-600 text-white mt-4 px-5 py-2 rounded-md">
                Select Options
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
