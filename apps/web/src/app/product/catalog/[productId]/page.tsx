import MenuNavbarUser from "@/components/header/header";
import Link from "next/link";
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
};

async function getProducts() {
  const res = await fetch("http://localhost:8000/api/v1/products", {
    cache: "no-store",
  });
  const json = await res.json();
  return json.data;
}

export default async function ProductCatalog() {
  const products = await getProducts();

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <MenuNavbarUser></MenuNavbarUser>
      {products.map((product: Product) => (
        <Link
          key={product.id}
          href={`/product/catalog/${product.id}`}
          className="border p-2 rounded shadow"
        >
          <h2 className="font-bold">{product.name}</h2>
          <p>{product.description}</p>
          <p>Price: Rp{product.price}</p>
          <p>Stock: {product.stock}</p>
          {/* {product.ProductImage?.[0]?.Image?.imageUrl && (
            
          )} */}
        </Link>
      ))}
    </div>
  );
}
