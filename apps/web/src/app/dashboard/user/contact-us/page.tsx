import MenuNavbarUser from "@/components/header/header-user/header";
import ContactSection from "@/components/menu/menu-user/contact-us";

export default function Contact() {
  return (
    <main className="bg-[#f7f8fa] min-h-screen text-black">
      <MenuNavbarUser>
        <ContactSection />
      </MenuNavbarUser>
    </main>
  );
}
