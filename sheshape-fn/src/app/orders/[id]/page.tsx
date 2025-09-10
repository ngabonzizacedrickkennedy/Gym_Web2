// src/app/orders/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { orderService, Order } from "@/services/orderService";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { OrderTracking } from "@/components/orders/OrderTracking";
import { toast } from "react-toastify";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = params?.id;

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const orderData = await orderService.getOrderById(Number(orderId));
      setOrder(orderData);
    } catch (error: any) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
      router.push("/orders");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrderTracking orderNumber={order.orderNumber} />
      </div>
    </div>
  );
}
