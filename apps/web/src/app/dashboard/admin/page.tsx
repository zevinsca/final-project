import MenuNavbarAdmin from "@/components/header/header-super-admin/header-super-admin";
import Dashboard from "@/components/menu/menu-admin/dashboard";

export default function HomeAdmin() {
  return (
    <MenuNavbarAdmin>
      <Dashboard />
    </MenuNavbarAdmin>
  );
}
