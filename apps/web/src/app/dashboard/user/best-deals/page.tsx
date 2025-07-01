import MenuNavbarUser from "@/components/header/header-user/header";
import BestDealsSection from "@/components/menu/menu-user/best-deals";

export default function BestDeals() {
  return (
    <main className="bg-[#f7f8fa] min-h-screen text-black">
      <MenuNavbarUser>
        <BestDealsSection />
      </MenuNavbarUser>
    </main>
  );
}
