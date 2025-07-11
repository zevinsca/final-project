"use client";

import { useState } from "react";
import { createStoreAdmin } from "../../../../../../lib/api/storeAdminApi";
import { useRouter } from "next/navigation";

export default function CreateAdminPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStoreAdmin({ name, email });
    router.push("/dashboard/admin/user-store/");
  };

  return (
    <div>
      <h1>Create Store Admin</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
