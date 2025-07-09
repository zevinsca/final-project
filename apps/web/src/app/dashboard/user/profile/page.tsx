import MenuNavbarUser from "@/components/header/header-user/header";

import ProfilePageSection from "@/components/menu/menu-user/profile";

export default function ProfilePage() {
  return (
    <main className="bg-[#f7f8fa] min-h-screen text-black">
      <MenuNavbarUser>
        <ProfilePageSection />
      </MenuNavbarUser>
    </main>
  );
}
