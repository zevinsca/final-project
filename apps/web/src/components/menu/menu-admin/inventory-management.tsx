"use client";

import { useEffect, useState } from "react";

interface Store {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imagePreview: { imageUrl: string }[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface InventoryJournal {
  id: string;
  storeId: string;
  productId: string;
  quantity: string;
  action: "RESTOCK" | "SALE" | "ADD";
  createdAt: string;
  Store: Store;
  Product: Product;
  User: User;
}

interface HistoryResponse {
  message: string;
  data: InventoryJournal[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function InventoryHistoryPage() {
  const [historyData, setHistoryData] = useState<InventoryJournal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Filter states
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [stores, setStores] = useState<Store[]>([]);

  const fetchStores = async (): Promise<void> => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/stores", {
        credentials: "include",
      });
      const result = await response.json();
      setStores(result.data || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchHistory = async (): Promise<void> => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStore) params.append("storeId", selectedStore);
      if (selectedAction) params.append("action", selectedAction);

      const response = await fetch(
        `http://localhost:8000/api/v1/inventory/history?${params}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: HistoryResponse = await response.json();
      setHistoryData(result.data || []);
      setError("");
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Failed to fetch inventory history");
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [selectedStore, selectedAction]);

  const getActionBadgeClass = (action: string): string => {
    switch (action) {
      case "ADD":
      case "RESTOCK":
        return "bg-green-100 text-green-800";
      case "SALE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQuantityDisplay = (
    quantity: string
  ): { value: string; color: string } => {
    const num = parseInt(quantity);
    return {
      value: num > 0 ? `+${quantity}` : quantity,
      color: num > 0 ? "text-green-600" : "text-red-600",
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Inventory History
        </h1>
        <p className="text-gray-600">
          Track all inventory changes and movements across stores
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Store
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Action
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="ADD">Add Stock</option>
              <option value="RESTOCK">Restock</option>
              <option value="SALE">Sale/Reduce</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedStore("");
                setSelectedAction("");
              }}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historyData.map((item) => {
                const quantityDisplay = getQuantityDisplay(item.quantity);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.createdAt).toLocaleString("id-ID", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.Product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Rp{item.Product.price.toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.Store.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeClass(item.action)}`}
                      >
                        {item.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={quantityDisplay.color}>
                        {quantityDisplay.value} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {item.User.firstName} {item.User.lastName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.User.role}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {historyData.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No inventory history found
            </div>
            <p className="text-gray-400 mt-2">
              Try adjusting your filters or check back later
            </p>
          </div>
        )}
      </div>

      {/* Summary Info */}
      {historyData.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="text-sm text-blue-800">
            Showing {historyData.length} inventory{" "}
            {historyData.length === 1 ? "transaction" : "transactions"}
            {selectedStore && ` for selected store`}
            {selectedAction && ` with action: ${selectedAction}`}
          </div>
        </div>
      )}
    </div>
  );
}
