"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface UseServerTableQueryOptions {
  endpoint: string;
  defaultSortBy?: string;
  defaultSortOrder?: "asc" | "desc";
  defaultLimit?: number;
}

interface UseServerTableQueryParams {
  search: string;
  category: string;
  sortBy: string;
  sortOrder: string;
  page: number;
}

export function useServerTableQuery<T>(options: UseServerTableQueryOptions) {
  const {
    endpoint,
    defaultSortBy = "createdAt",
    defaultSortOrder = "desc",
    defaultLimit = 10,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<UseServerTableQueryParams>({
    search: "",
    category: "",
    sortBy: defaultSortBy,
    sortOrder: defaultSortOrder,
    page: 1,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search: params.search,
        category: params.category,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        page: params.page.toString(),
        limit: defaultLimit.toString(),
      }).toString();

      const res = await axios.get(`${endpoint}?${query}`, {
        withCredentials: true,
      });

      setData(res.data.data);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  return {
    data,
    loading,
    params,
    setParams,
  };
}
