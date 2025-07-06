"use client";

import MenuNavbarUser from "@/components/header/header-user/header";
import HomePageUser from "@/components/menu/menu-user/home";

export default function HomePage() {
  return (
    <main className="bg-[#f7f8fa] min-h-screen text-black">
      <MenuNavbarUser>
        <HomePageUser />
      </MenuNavbarUser>
    </main>
  );
}
