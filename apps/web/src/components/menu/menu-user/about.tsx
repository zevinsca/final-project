import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="max-w-[1200px] mx-auto py-12 px-6 space-y-12">
      {/* Grid Text + Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-6 rounded-xl">
        {/* Text */}
        <div>
          <h2 className="text-3xl font-bold mb-4">
            We Prefer only Organic Foods
          </h2>
          <p className="text-gray-600">
            Donec diam diam, mattis imperdiet est vitae, faucibus molestie nisi.
            Aliquam sed risus nec arcu rhoncus molestie pretium non neque.
            Suspendisse eu ex ligula. Vestibulum maximus tellus metus, eget
            volutpat mi volutpat eget. Sed tempus erat at cursus facilisis.
            Maecenas id justo libero. Suspendisse quis tortor at odio pulvinar
            porttitor non sed mauris.
          </p>
        </div>

        {/* Image */}
        <div className="flex justify-center">
          <Image
            src="/images/limes.png"
            alt="Organic Limes"
            width={400}
            height={300}
            className="rounded-lg border"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-700 text-white text-center py-8 rounded-lg">
          <p className="text-3xl font-bold mb-2">450+</p>
          <p className="uppercase tracking-wide">Items</p>
        </div>
        <div className="bg-green-700 text-white text-center py-8 rounded-lg">
          <p className="text-3xl font-bold mb-2">300+</p>
          <p className="uppercase tracking-wide">Stores</p>
        </div>
        <div className="bg-green-700 text-white text-center py-8 rounded-lg">
          <p className="text-3xl font-bold mb-2">40,000+</p>
          <p className="uppercase tracking-wide">Happy Users</p>
        </div>
        <div className="bg-green-700 text-white text-center py-8 rounded-lg">
          <p className="text-3xl font-bold mb-2">7,889+</p>
          <p className="uppercase tracking-wide">5 Star Reviews</p>
        </div>
      </div>
    </section>
  );
}
