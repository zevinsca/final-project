import MenuNavbarUser from "@/components/header/header-user/header";
import ProductHomePage from "@/components/menu/menu-user/home-product";
import SearchSection from "@/components/search/search.page";

export default function HomePage() {
  return (
    <main className="bg-[#f7f8fa] min-h-screen text-black">
      <MenuNavbarUser>
        <SearchSection />
        <ProductHomePage />
      </MenuNavbarUser>
    </main>
  );
}
