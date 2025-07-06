import MenuNavbarUser from "@/components/header/header-user/header";
import BestDealsSection from "@/components/menu/menu-user/best-deals";

export default function BestDeals() {
  return (
    <main>
      <MenuNavbarUser>
        <BestDealsSection />
      </MenuNavbarUser>
    </main>
  );
}
