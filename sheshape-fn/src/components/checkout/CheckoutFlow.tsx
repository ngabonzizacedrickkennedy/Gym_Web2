// src/components/checkout/CheckoutFlow.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEnhancedCart } from "@/context/EnhancedCartContext";
import {
  orderService,
  CheckoutRequest,
  Address,
} from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ShippingForm } from "./ShippingForm";
import { PaymentForm } from "./PaymentForm";
import { OrderSummary } from "./OrderSummary";
import { CheckoutSteps } from "./CheckoutSteps";
import {
  ShoppingCart,
  Truck,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";

type CheckoutStep = "shipping" | "payment" | "review" | "success";

interface CheckoutState {
  shippingAddress: Address | null;
  billingAddress: Address | null;
  paymentMethod: CheckoutRequest["paymentMethod"] | null;
  paymentDetails: CheckoutRequest["paymentDetails"] | null;
  notes: string;
  useSameAddress: boolean;
}

export function CheckoutFlow() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    shippingAddress: null,
    billingAddress: null,
    paymentMethod: null,
    paymentDetails: null,
    notes: "",
    useSameAddress: true,
  });

  const { isAuthenticated, user } = useAuth();
  const { cart, totalItems, totalPrice, validateCart, refreshCart } =
    useEnhancedCart();
  const router = useRouter();

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?returnTo=/checkout");
      return;
    }

    if (!cart || totalItems === 0) {
      toast.error("Your cart is empty");
      router.push("/shop");
    }
  }, [isAuthenticated, cart, totalItems, router]);

  // Validate cart on mount
  useEffect(() => {
    if (cart && totalItems > 0) {
      validateCart();
    }
  }, [cart, totalItems, validateCart]);

  const updateCheckoutState = (updates: Partial<CheckoutState>) => {
    setCheckoutState((prev) => ({ ...prev, ...updates }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case "shipping":
        return checkoutState.shippingAddress !== null;
      case "payment":
        return (
          checkoutState.paymentMethod !== null &&
          (checkoutState.paymentMethod === "CASH_ON_DELIVERY" ||
            checkoutState.paymentDetails !== null)
        );
      case "review":
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (!canProceedToNextStep()) return;

    const steps: CheckoutStep[] = ["shipping", "payment", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const steps: CheckoutStep[] = ["shipping", "payment", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutState.shippingAddress || !checkoutState.paymentMethod) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsProcessing(true);

    try {
      // Final cart validation
      const isValid = await validateCart();
      if (!isValid) {
        toast.error("Please review your cart and try again");
        setCurrentStep("shipping");
        return;
      }

      const checkoutRequest: CheckoutRequest = {
        paymentMethod: checkoutState.paymentMethod,
        shippingAddress: checkoutState.shippingAddress,
        billingAddress: checkoutState.useSameAddress
          ? checkoutState.shippingAddress
          : checkoutState.billingAddress || checkoutState.shippingAddress,
        notes: checkoutState.notes || undefined,
        paymentDetails: checkoutState.paymentDetails || undefined,
      };

      const order = await orderService.checkout(checkoutRequest);
      setOrderId(order.id);
      setCurrentStep("success");

      // Refresh cart to clear it
      await refreshCart();

      toast.success("Order placed successfully!");
    } catch (error: any) {
      console.error("Checkout error:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to place order. Please try again.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || !cart || totalItems === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentStep !== "success" && (
          <div className="mb-8">
            <CheckoutSteps currentStep={currentStep} />
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Main Content */}
          <div className="lg:col-span-7">
            {currentStep === "shipping" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ShippingForm
                    shippingAddress={checkoutState.shippingAddress}
                    billingAddress={checkoutState.billingAddress}
                    useSameAddress={checkoutState.useSameAddress}
                    onUpdate={updateCheckoutState}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentForm
                    paymentMethod={checkoutState.paymentMethod}
                    paymentDetails={checkoutState.paymentDetails}
                    onUpdate={updateCheckoutState}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === "review" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-medium mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {cart.items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between py-2 border-b"
                        >
                          <div>
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="font-medium">
                            $
                            {(
                              (item.product.discountPrice ||
                                item.product.price) * item.quantity
                            ).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Addresses */}
                  <div>
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <div className="text-sm text-gray-600">
                      {checkoutState.shippingAddress && (
                        <div>
                          <p>
                            {checkoutState.shippingAddress.firstName}{" "}
                            {checkoutState.shippingAddress.lastName}
                          </p>
                          <p>{checkoutState.shippingAddress.street}</p>
                          <p>
                            {checkoutState.shippingAddress.city},{" "}
                            {checkoutState.shippingAddress.state}{" "}
                            {checkoutState.shippingAddress.zipCode}
                          </p>
                          <p>{checkoutState.shippingAddress.country}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <div className="text-sm text-gray-600">
                      <Badge variant="outline">
                        {checkoutState.paymentMethod?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>

                  {/* Notes */}
                  {checkoutState.notes && (
                    <div>
                      <h3 className="font-medium mb-2">Order Notes</h3>
                      <p className="text-sm text-gray-600">
                        {checkoutState.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === "success" && orderId && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Order Placed Successfully!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for your order. We'll send you a confirmation
                    email shortly.
                  </p>
                  <div className="space-y-4">
                    <Button asChild>
                      <a href={`/orders/${orderId}`}>View Order Details</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/shop">Continue Shopping</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {currentStep !== "success" && (
            <div className="mt-8 lg:mt-0 lg:col-span-5">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderSummary cart={cart} />

                  <Separator className="my-6" />

                  {/* Navigation Buttons */}
                  <div className="space-y-4">
                    {currentStep === "review" ? (
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="w-full"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Processing Order...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextStep}
                        disabled={!canProceedToNextStep()}
                        className="w-full"
                        size="lg"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}

                    {currentStep !== "shipping" && (
                      <Button
                        variant="outline"
                        onClick={handlePrevStep}
                        className="w-full"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
