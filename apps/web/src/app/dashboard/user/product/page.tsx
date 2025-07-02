import MenuNavbarUser from "@/components/header/header-user/header";
import ProductCatalog from "@/components/menu/menu-user/product";

export default function HomePage() {
  return (
    <main className="bg-[#f7f8fa] min-h-screen text-black">
      <MenuNavbarUser>
        <ProductCatalog />
      </MenuNavbarUser>
    </main>
  );
}
