"use client";

import { useEffect, useState, useCallback } from "react";
import UpdateUserModal from "./edit-user";

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleInput, setRoleInput] = useState("USER");

  const getAllUser = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/user");
      const data = await res.json();
      if (Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        console.error("Format data API tidak sesuai");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    getAllUser();
  }, [getAllUser]);

  async function handleUpdateUser() {
    if (!selectedUserId || !roleInput) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/user/${selectedUserId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: roleInput }),
        }
      );

      if (res.ok) {
        setShowModal(false);
        setRoleInput("USER");
        await getAllUser();
      } else {
        const data = await res.json();
        alert("Gagal update: " + data.message);
      }
    } catch (err) {
      console.error("Gagal update:", err);
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Super Admin</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 border-b">ID</th>
              <th className="text-left px-4 py-2 border-b">Name</th>
              <th className="text-left px-4 py-2 border-b">Email</th>
              <th className="text-left px-4 py-2 border-b">Role</th>
              <th className="text-left px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Tidak ada data user.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{user.id}</td>
                  <td className="px-4 py-2 border-b">
                    {user.firstName ?? "-"} {user.lastName ?? ""}
                  </td>
                  <td className="px-4 py-2 border-b">{user.email}</td>
                  <td className="px-4 py-2 border-b">{user.role}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setRoleInput(user.role);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedUserId && (
        <UpdateUserModal
          userEmail={users.find((u) => u.id === selectedUserId)?.email || ""}
          roleInput={roleInput}
          onRoleChange={setRoleInput}
          onClose={() => {
            setShowModal(false);
            setRoleInput("USER");
          }}
          onSave={handleUpdateUser}
        />
      )}
    </main>
  );
}
