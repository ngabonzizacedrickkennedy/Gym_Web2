// src/components/orders/OrderCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Order } from "@/services/orderService";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  Eye,
  X,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { toast } from "react-toastify";

interface OrderCardProps {
  order: Order;
  onCancelOrder?: (orderId: number, reason?: string) => Promise<void>;
  className?: string;
}

export function OrderCard({ order, onCancelOrder, className }: OrderCardProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const canCancel = () => {
    return (
      (order.status === "PENDING" ||
        order.status === "CONFIRMED" ||
        order.status === "PROCESSING") &&
      order.paymentStatus !== "REFUNDED"
    );
  };

  const handleCancelOrder = async () => {
    if (!onCancelOrder) return;

    setIsCancelling(true);
    try {
      await onCancelOrder(order.id);
      setShowCancelDialog(false);
      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "CONFIRMED":
      case "PROCESSING":
        return <Loader className="h-4 w-4" />;
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return <Truck className="h-4 w-4" />;
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
      case "RETURNED":
        return <X className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "OUT_FOR_DELIVERY":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "RETURNED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDeliveryEstimate = () => {
    if (order.estimatedDeliveryDate) {
      return formatDate(order.estimatedDeliveryDate);
    }

    // Calculate estimate based on order date + 5-7 days
    const orderDate = new Date(order.createdAt);
    const estimatedDate = new Date(
      orderDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    return formatDate(estimatedDate.toISOString());
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${className}`}>
        <CardContent className="p-6">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">
                  Order #{order.orderNumber}
                </h3>
                <Badge
                  variant="outline"
                  className={getStatusColor(order.status)}
                >
                  {getStatusIcon(order.status)}
                  <span className="ml-1">
                    {order.status.replace(/_/g, " ")}
                  </span>
                </Badge>
              </div>

              <div className="flex items-center text-sm text-gray-600 gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Placed {formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  <span>{order.paymentMethod.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(order.totalAmount)}
              </div>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus}
              </Badge>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Show first few items */}
            <div className="space-y-2">
              {order.items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {item.productImageUrl && (
                      <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-gray-900 truncate block">
                        {item.productName}
                      </span>
                      <span className="text-gray-500">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900 flex-shrink-0">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}

              {order.items.length > 3 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  +{order.items.length - 3} more items
                </div>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          {(order.status === "SHIPPED" ||
            order.status === "OUT_FOR_DELIVERY" ||
            order.status === "DELIVERED") && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium text-blue-900">
                    {order.status === "DELIVERED" ? "Delivered" : "Shipping"}
                  </div>
                  {order.trackingNumber && (
                    <div className="text-sm text-blue-700">
                      Tracking:{" "}
                      <span className="font-mono">{order.trackingNumber}</span>
                    </div>
                  )}
                  <div className="text-sm text-blue-700">
                    {order.status === "DELIVERED"
                      ? "Package was delivered"
                      : `Expected delivery: ${getDeliveryEstimate()}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Shipping to:
                </div>
                <div className="text-sm text-gray-600">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                  <br />
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </div>
              </div>
            </div>
          </div>

          {/* Special Notices */}
          {order.status === "CANCELLED" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-900">
                    Order Cancelled
                  </div>
                  <div className="text-sm text-red-700">
                    This order has been cancelled. If you were charged, a refund
                    will be processed.
                  </div>
                </div>
              </div>
            </div>
          )}

          {order.paymentStatus === "FAILED" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-900">
                    Payment Failed
                  </div>
                  <div className="text-sm text-red-700">
                    There was an issue with your payment. Please contact support
                    for assistance.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/orders/${order.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>

            {order.trackingNumber && (
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/orders/track/${order.orderNumber}`}>
                  <Truck className="mr-2 h-4 w-4" />
                  Track Order
                </Link>
              </Button>
            )}

            {canCancel() && onCancelOrder && (
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(true)}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel Order
                  </>
                )}
              </Button>
            )}

            {/* Reorder button for delivered orders */}
            {order.status === "DELIVERED" && (
              <Button asChild variant="default" className="flex-1">
                <Link href={`/orders/${order.id}/reorder`}>
                  <Package className="mr-2 h-4 w-4" />
                  Reorder
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Order Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancel Order #{order.orderNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel your order. If payment has been processed,
              a refund will be initiated within 3-5 business days. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Order"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
