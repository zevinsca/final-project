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
  id: string;
  createdAt?: string;
}

import { useEffect, useState } from "react";
import {
  getAllStoreAdmins,
  deleteStoreAdmin,
} from "../../../../../lib/api/storeAdminApi";

import Link from "next/link";

export default function AdminPage() {
  const [admins, setAdmins] = useState<StoreAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await getAllStoreAdmins();
      setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      await deleteStoreAdmin(id);
      fetchAdmins();
    }
  };

  return (
    <div>
      <h1>Store Admins</h1>
      <Link href="/dashboard/admin/user-store/create">
        <button>Add New Store Admin</button>
      </Link>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.firstName}</td>
                <td>{admin.email}</td>
                <td>
                  <Link href={`/dashboard/admin/user-store/${admin.id}`}>
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(admin.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
