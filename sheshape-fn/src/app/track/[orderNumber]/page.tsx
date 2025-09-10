// src/app/track/[orderNumber]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { OrderTracking } from "@/components/orders/OrderTracking";

export default function TrackOrderPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Order Number
          </h1>
          <p className="text-gray-600">
            Please provide a valid order number to track your order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrderTracking orderNumber={orderNumber} />
      </div>
    </div>
  );
}
