"use client";

interface StoreAdminInput {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber: string;
}

interface StoreAdmin extends StoreAdminInput {
  name: string;
  id: string;
  createdAt?: string;
}

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getAllStoreAdmins,
  updateStoreAdmin,
} from "../../../../../../lib/api/storeAdminApi";

export default function EditAdminPage() {
  const { id } = useParams();
  const router = useRouter();
  const [admin, setAdmin] = useState<StoreAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    setLoading(true);
    try {
      const data = await getAllStoreAdmins();
      const found = data.find((a) => a.id === id);
      if (found) setAdmin(found);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;
    await updateStoreAdmin(admin.id, {
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      username: admin.username,
      password: admin.password,
      phoneNumber: admin.phoneNumber,
    });
    router.push("/dashboard/admin/user-store");
  };

  if (loading) return <p>Loading...</p>;
  if (!admin) return <p>Not found</p>;

  return (
    <div>
      <h1>Edit Store Admin</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={admin.name}
          onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
        />
        <input
          value={admin.email}
          onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
