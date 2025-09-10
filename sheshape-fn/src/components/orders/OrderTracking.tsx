// src/components/orders/OrderTracking.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { orderService, Order } from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

interface OrderTrackingProps {
  orderNumber: string;
}

export function OrderTracking({ orderNumber }: OrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchOrderTracking();
  }, [orderNumber]);

  const fetchOrderTracking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const orderData = await orderService.trackOrder(orderNumber);
      setOrder(orderData);
    } catch (error: any) {
      console.error("Error tracking order:", error);
      const message = error?.response?.data?.message || "Order not found";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "CONFIRMED":
      case "PROCESSING":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "CANCELLED":
      case "RETURNED":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrackingSteps = (status: Order["status"]) => {
    const steps = [
      {
        id: "PENDING",
        name: "Order Placed",
        description: "Your order has been placed",
      },
      {
        id: "CONFIRMED",
        name: "Confirmed",
        description: "Order confirmed and being prepared",
      },
      {
        id: "PROCESSING",
        name: "Processing",
        description: "Your items are being packed",
      },
      {
        id: "SHIPPED",
        name: "Shipped",
        description: "Your order is on its way",
      },
      {
        id: "OUT_FOR_DELIVERY",
        name: "Out for Delivery",
        description: "Your order is out for delivery",
      },
      {
        id: "DELIVERED",
        name: "Delivered",
        description: "Your order has been delivered",
      },
    ];

    const currentStepIndex = steps.findIndex((step) => step.id === status);

    return steps.map((step, index) => ({
      ...step,
      status: index <= currentStepIndex ? "completed" : "upcoming",
      isCurrent: index === currentStepIndex,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Order Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "The order you are looking for could not be found."}
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push("/orders")}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const trackingSteps = getTrackingSteps(order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span>Order #{order.orderNumber}</span>
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge
              className={`text-sm ${
                order.status === "DELIVERED"
                  ? "bg-green-100 text-green-800"
                  : order.status === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tracking Number */}
            {order.trackingNumber && (
              <div>
                <h3 className="font-medium mb-2">Tracking Number</h3>
                <p className="text-lg font-mono bg-gray-100 p-2 rounded">
                  {order.trackingNumber}
                </p>
              </div>
            )}

            {/* Estimated Delivery */}
            {order.estimatedDeliveryDate && (
              <div>
                <h3 className="font-medium mb-2">Estimated Delivery</h3>
                <p className="text-lg">
                  {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tracking Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trackingSteps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === "completed"
                      ? "bg-green-500"
                      : step.isCurrent
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${
                        step.isCurrent ? "bg-white" : "bg-gray-500"
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`font-medium ${
                        step.isCurrent
                          ? "text-blue-600"
                          : step.status === "completed"
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </h4>
                    {step.isCurrent && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Items */}
          <div>
            <h3 className="font-medium mb-4">Items ({order.items.length})</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <div>
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      ${item.unitPrice.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Shipping Address
              </h3>
              <div className="text-sm text-gray-600">
                <p>
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Payment Method</h3>
              <div className="text-sm text-gray-600">
                <Badge variant="outline">
                  {order.paymentMethod.replace(/_/g, " ")}
                </Badge>
                <p className="mt-1">Status: {order.paymentStatus}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${order.totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${order.taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg border-t pt-2">
                <span>Total:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
