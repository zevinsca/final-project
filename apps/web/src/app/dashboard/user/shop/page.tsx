import MenuNavbarUser from "@/components/header/header-user/header";
import ShopSection from "@/components/menu/menu-user/shop";

export default function Shop() {
  return (
    <main className="bg-[#f7f8fa] min-h-screen text-black">
      <MenuNavbarUser>
        <ShopSection />
      </MenuNavbarUser>
    </main>
  );
}
