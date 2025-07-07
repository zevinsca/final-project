import MenuNavbarStoreAdmin from "@/components/header/header-admin-store/header-admin-store";
import StoreDetailPage from "@/components/menu/menu-store-admin/store-by-id";

export default function StoreByIdPage({
  params,
}: {
  params: { storeId: string };
}) {
  return (
    <MenuNavbarStoreAdmin>
      <StoreDetailPage params={params} />
    </MenuNavbarStoreAdmin>
  );
}
