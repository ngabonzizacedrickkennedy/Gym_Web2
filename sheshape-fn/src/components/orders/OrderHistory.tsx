// src/components/orders/OrderHistory.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { orderService, Order, OrderPage } from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { OrderCard } from "./OrderCard";
import { Package, ShoppingBag, Filter, Search, Calendar } from "lucide-react";
import { toast } from "react-toastify";

export function OrderHistory() {
  const [orders, setOrders] = useState<OrderPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "totalAmount">(
    "createdAt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, currentPage, filterStatus, sortBy, sortDirection]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getMyOrders(
        currentPage,
        10,
        sortBy,
        sortDirection
      );
      setOrders(response);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await orderService.cancelOrder(orderId, "Cancelled by customer");
      toast.success("Order cancelled successfully");
      await fetchOrders(); // Refresh the list
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to cancel order";
      toast.error(message);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";
      case "OUT_FOR_DELIVERY":
        return "bg-orange-100 text-orange-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "RETURNED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Login Required
        </h2>
        <p className="text-gray-600">
          Please log in to view your order history.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!orders?.content?.length) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
        <p className="text-gray-600 mb-6">
          You haven't placed any orders yet. Start shopping to see your order
          history here.
        </p>
        <Button asChild>
          <a href="/shop">Start Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600">
            {orders.totalElements}{" "}
            {orders.totalElements === 1 ? "order" : "orders"} found
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "createdAt" | "totalAmount")
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="totalAmount">Sort by Amount</option>
          </select>

          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.content.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onCancelOrder={handleCancelOrder}
          />
        ))}
      </div>

      {/* Pagination */}
      {orders.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={orders.first}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {orders.totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage(Math.min(orders.totalPages - 1, currentPage + 1))
            }
            disabled={orders.last}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
