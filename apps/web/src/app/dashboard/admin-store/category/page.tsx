import MenuNavbarStoreAdmin from "@/components/header/header-admin-store/header-admin-store";
import AdminStoreCategoryPage from "@/components/menu/menu-store-admin/category";

export default function HomeAdmin() {
  return (
    <MenuNavbarStoreAdmin>
      <AdminStoreCategoryPage />
    </MenuNavbarStoreAdmin>
  );
}
