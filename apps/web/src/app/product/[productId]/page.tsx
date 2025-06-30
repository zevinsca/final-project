// import MenuNavbarUser from "@/components/header/header-admin";
import { notFound } from "next/navigation";

async function getProductDetail(productId: string) {
  const res = await fetch(
    `http://localhost:8000/api/v1/products/${productId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await getProductDetail(params.productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <p className="text-lg font-semibold">Price: ${product.price}</p>
      <p className="text-lg">Stock: {product.stock}</p>
    </div>
  );
}

// export default function CatalogPage() {
//   return (
//     <main className="bg-[#f7f8fa] min-h-screen text-black">
//       <MenuNavbarUser>b</MenuNavbarUser>
//     </main>
//   );
// }
