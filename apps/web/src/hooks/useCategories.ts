// src/hooks/useCategories.ts
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export interface Category {
  id: string;
  name: string;
}

export function useCategories() {
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/categories", {
          withCredentials: true,
        });
        const nameList = (res.data.data || []).map(
          (c: { name: string }) => c.name
        );
        setNames(nameList);
      } catch (err) {
        console.error("Failed to fetch category names", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNames();
  }, []);

  return { names, loading };
}
