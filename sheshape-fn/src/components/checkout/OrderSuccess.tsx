// src/components/checkout/OrderSuccess.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Order } from "@/services/orderService";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  Share2,
  ArrowLeft,
  Eye,
  Copy,
  CheckCheck,
} from "lucide-react";
import { toast } from "react-toastify";

interface OrderSuccessProps {
  order: Order;
  className?: string;
}

export function OrderSuccess({ order, className }: OrderSuccessProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      toast.success("Order number copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy order number");
    }
  };

  const handleShareOrder = async () => {
    const shareText = `My order #${
      order.orderNumber
    } has been placed successfully! Total: ${formatPrice(order.totalAmount)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Order Confirmation",
          text: shareText,
          url: window.location.origin + `/orders/${order.id}`,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Order details copied to clipboard!");
      } catch (error) {
        toast.error("Failed to share order details");
      }
    }
  };

  const getEstimatedDeliveryDate = () => {
    if (order.estimatedDeliveryDate) {
      return new Date(order.estimatedDeliveryDate).toLocaleDateString();
    }

    // Default to 5-7 business days from now
    const today = new Date();
    const deliveryDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return deliveryDate.toLocaleDateString();
  };

  const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your purchase. Your order has been received and is
              being processed.
            </p>

            {/* Order Number */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-600">
                Order Number:
              </span>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
                <span className="font-mono text-lg font-bold text-primary">
                  {order.orderNumber}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyOrderNumber}
                  className="h-6 w-6 p-0"
                >
                  {copied ? (
                    <CheckCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href={`/orders/${order.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Order Details
                </Link>
              </Button>
              <Button variant="outline" onClick={handleShareOrder}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Order
              </Button>
              <Button variant="outline" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Order Status</span>
              <Badge variant="secondary">{order.status}</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payment Status</span>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className="text-sm font-medium">
                {order.paymentMethod.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Order Date</span>
              <span className="text-sm font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estimated Delivery</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {getEstimatedDeliveryDate()}
              </span>
            </div>

            {order.trackingNumber && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tracking Number</span>
                <span className="text-sm font-medium font-mono">
                  {order.trackingNumber}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.street}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>

            {order.shippingAddress.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {order.shippingAddress.phone}
                </span>
              </div>
            )}

            {order.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Delivery Notes:
                </p>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                {/* Product Image */}
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.productImageUrl ? (
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {item.productName}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Qty: {item.quantity}</span>
                    <span>Unit Price: {formatPrice(item.unitPrice)}</span>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Order Total */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>

            {order.totalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">
                  -{formatPrice(order.totalDiscount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span>
                {order.shippingCost > 0
                  ? formatPrice(order.shippingCost)
                  : "Free"}
              </span>
            </div>

            {order.taxes > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>{formatPrice(order.taxes)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Order Confirmation
                </h4>
                <p className="text-sm text-gray-600">
                  You'll receive an email confirmation shortly with your order
                  details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Processing</h4>
                <p className="text-sm text-gray-600">
                  We'll process your order and prepare it for shipping within
                  1-2 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Shipping</h4>
                <p className="text-sm text-gray-600">
                  Once shipped, you'll receive tracking information to monitor
                  your package.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Delivery</h4>
                <p className="text-sm text-gray-600">
                  Your order will be delivered to your specified address by{" "}
                  {getEstimatedDeliveryDate()}.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you have any questions about your order, don't hesitate to
              contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/support">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/orders">
                  <Package className="mr-2 h-4 w-4" />
                  View All Orders
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => router.push("/shop")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Button>
      </div>
    </div>
  );
}
