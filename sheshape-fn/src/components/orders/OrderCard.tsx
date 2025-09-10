// src/components/orders/OrderCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Order } from "@/services/orderService";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Eye,
  X,
  Truck,
  CheckCircle,
} from "lucide-react";

interface OrderCardProps {
  order: Order;
  onCancelOrder: (orderId: number) => void;
}

export function OrderCard({ order, onCancelOrder }: OrderCardProps) {
  const [showDetails, setShowDetails] = useState(false);

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

  const canCancelOrder = () => {
    return (
      ["PENDING", "CONFIRMED"].includes(order.status) &&
      order.paymentStatus !== "COMPLETED"
    );
  };

  const handleCancelClick = () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      onCancelOrder(order.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Order #{order.orderNumber}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex space-x-2">
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace(/_/g, " ")}
              </Badge>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus}
              </Badge>
            </div>
            <div className="text-lg font-bold text-primary">
              {formatPrice(order.totalAmount)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items Preview */}
        <div className="flex items-center space-x-4">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, index) => (
              <div
                key={item.id}
                className="relative h-12 w-12 rounded-full border-2 border-white overflow-hidden bg-gray-100"
                style={{ zIndex: 3 - index }}
              >
                {item.productImageUrl ? (
                  <Image
                    src={item.productImageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="relative h-12 w-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-medium">
                  +{order.items.length - 3}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </p>
            <p className="text-xs text-gray-500">
              {order.items[0]?.productName}
              {order.items.length > 1 && ` and ${order.items.length - 1} more`}
            </p>
          </div>
        </div>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <div className="flex items-center space-x-2 text-sm">
            <Truck className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Tracking:</span>
            <span className="font-medium">{order.trackingNumber}</span>
          </div>
        )}

        {/* Estimated Delivery */}
        {order.estimatedDeliveryDate && (
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">Estimated delivery:</span>
            <span className="font-medium">
              {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {showDetails ? "Hide Details" : "View Details"}
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href={`/orders/${order.id}`}>Full Details</Link>
            </Button>
          </div>

          <div className="flex space-x-2">
            {order.trackingNumber && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/track/${order.orderNumber}`}>Track Order</Link>
              </Button>
            )}

            {canCancelOrder() && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelClick}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="pt-4 border-t space-y-4">
            {/* Shipping Address */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">Shipping Address</span>
              </div>
              <div className="text-sm text-gray-600 ml-6">
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

            {/* Payment Method */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">Payment Method</span>
              </div>
              <div className="text-sm text-gray-600 ml-6">
                {order.paymentMethod.replace(/_/g, " ")}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <span className="font-medium text-sm">Items Ordered</span>
              <div className="mt-2 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{item.productName}</span>
                      <span className="text-gray-500">× {item.quantity}</span>
                    </div>
                    <span className="font-medium">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatPrice(order.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatPrice(order.taxes)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
