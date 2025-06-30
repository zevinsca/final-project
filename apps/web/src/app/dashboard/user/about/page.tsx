import MenuNavbarUser from "@/components/header/header-user/header";
import AboutSection from "@/components/menu/menu-user/about";

export default function About() {
  return (
    <main className="bg-[#f7f8fa] min-h-screen text-black">
      <MenuNavbarUser>
        <AboutSection />
      </MenuNavbarUser>
    </main>
  );
}
