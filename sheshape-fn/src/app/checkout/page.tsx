"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useEnhancedCart } from "@/context/EnhancedCartContext";
import { orderService } from "@/services/orderService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import {
  CreditCard,
  Truck,
  Shield,
  Check,
  Edit,
  AlertCircle,
  Lock,
  Package,
  Star,
  ChevronRight,
  ChevronDown,
  Eye,
} from "lucide-react";

// Type definitions
type StepId = "shipping" | "payment" | "review" | "success";
type PaymentMethod = "CREDIT_CARD" | "PAYPAL" | "DIGITAL_WALLET";
type SectionKey = "shipping" | "payment" | "review";

interface ShippingData {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
  useSameForBilling: boolean;
}

interface PaymentData {
  paymentMethod: PaymentMethod;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolderName: string;
  saveCard: boolean;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  inStock: boolean;
}

interface Step {
  id: StepId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Mock data based on your project structure
const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: "Premium Whey Protein Powder",
    price: 49.99,
    quantity: 2,
    image: "/api/placeholder/80/80",
    category: "Supplements",
    inStock: true,
  },
  {
    id: 2,
    name: "Organic Pre-Workout Mix",
    price: 34.99,
    quantity: 1,
    image: "/api/placeholder/80/80",
    category: "Supplements",
    inStock: true,
  },
  {
    id: 3,
    name: "Fitness Resistance Bands Set",
    price: 24.99,
    quantity: 1,
    image: "/api/placeholder/80/80",
    category: "Equipment",
    inStock: true,
  },
];

const mockUser = {
  profile: {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    phoneNumber: "+1-555-0123",
  },
};

export default function RealisticCheckoutPage() {
  const [currentStep, setCurrentStep] = useState<StepId>("shipping");
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    shipping: true,
    payment: false,
    review: false,
  });
  const [shippingData, setShippingData] = useState<ShippingData>({
    firstName: mockUser.profile.firstName,
    lastName: mockUser.profile.lastName,
    phone: mockUser.profile.phoneNumber,
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "RW",
    notes: "",
    useSameForBilling: true,
  });
  const [paymentData, setPaymentData] = useState<PaymentData>({
    paymentMethod: "CREDIT_CARD",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardHolderName: "",
    saveCard: false,
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const { cart, clearCart } = useEnhancedCart();
  const router = useRouter();

  const steps: Step[] = [
    { id: "shipping", name: "Shipping", icon: Truck },
    { id: "payment", name: "Payment", icon: CreditCard },
    { id: "review", name: "Review", icon: Eye },
    { id: "success", name: "Success", icon: Check },
  ];

  const subtotal = mockCartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingCost = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompletedSteps((prev) => [
      ...prev.filter((step) => step !== "shipping"),
      "shipping",
    ]);
    setCurrentStep("payment");
    setExpandedSections({
      shipping: false,
      payment: true,
      review: false,
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompletedSteps((prev) => [
      ...prev.filter((step) => step !== "payment"),
      "payment",
    ]);
    setCurrentStep("review");
    setExpandedSections({
      shipping: false,
      payment: false,
      review: true,
    });
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to place an order");
      router.push("/login?returnTo=/checkout");
      return;
    }

    if (!cart?.items?.length) {
      toast.error("Your cart is empty");
      router.push("/shop");
      return;
    }

    setIsPlacingOrder(true);
    setOrderError(null);

    try {
      const checkoutRequest = {
        paymentMethod: paymentData.paymentMethod,
        shippingAddress: {
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          phone: shippingData.phone,
          street: shippingData.street,
          city: shippingData.city,
          state: shippingData.state,
          zipCode: shippingData.zipCode,
          country: shippingData.country,
        },
        customerNotes: shippingData.notes || undefined,
        paymentDetails:
          paymentData.paymentMethod === "CREDIT_CARD"
            ? {
                cardNumber: paymentData.cardNumber,
                cardHolderName: paymentData.cardHolderName,
                expiryMonth: paymentData.expiryMonth,
                expiryYear: paymentData.expiryYear,
                cvv: paymentData.cvv,
              }
            : undefined,
      };

      const order = await orderService.checkout(checkoutRequest);
      await clearCart();
      toast.success(`Order placed successfully! Order #${order.orderNumber}`);
      setCompletedSteps((prev) => [...prev, "review"]);
      setCurrentStep("success");
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to place order. Please try again.";
      setOrderError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const IconComponent = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`ml-3 text-sm font-medium ${
                      isCompleted || isCurrent
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-gray-400 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div
                onClick={() => toggleSection("shipping")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSection("shipping");
                  }
                }}
                className="w-full p-6 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                role="button"
                tabIndex={0}
                aria-expanded={expandedSections.shipping}
                aria-controls="shipping-content"
              >
                <div>
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Shipping Address
                    </h3>
                    {completedSteps.includes("shipping") && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  {completedSteps.includes("shipping") && (
                    <p className="mt-2 text-sm text-gray-600">
                      {shippingData.firstName} {shippingData.lastName},{" "}
                      {shippingData.street}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {completedSteps.includes("shipping") &&
                    currentStep !== "shipping" && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentStep("shipping");
                          setExpandedSections({
                            shipping: true,
                            payment: false,
                            review: false,
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentStep("shipping");
                            setExpandedSections({
                              shipping: true,
                              payment: false,
                              review: false,
                            });
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                        role="button"
                        tabIndex={0}
                      >
                        Edit
                      </div>
                    )}
                  {expandedSections.shipping ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedSections.shipping && (
                <div id="shipping-content" className="px-6 pb-6 border-t">
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={shippingData.firstName}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={shippingData.lastName}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={shippingData.phone}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={shippingData.street}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            street: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={shippingData.city}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              city: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={shippingData.state}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              state: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={shippingData.zipCode}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              zipCode: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Any special delivery instructions..."
                        value={shippingData.notes}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="same-billing"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={shippingData.useSameForBilling}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            useSameForBilling: e.target.checked,
                          })
                        }
                      />
                      <label
                        htmlFor="same-billing"
                        className="ml-2 text-sm text-gray-600"
                      >
                        Use same address for billing
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div
                onClick={() => toggleSection("payment")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSection("payment");
                  }
                }}
                className="w-full p-6 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                role="button"
                tabIndex={0}
                aria-expanded={expandedSections.payment}
                aria-controls="payment-content"
              >
                <div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Payment Method
                    </h3>
                    {completedSteps.includes("payment") && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  {completedSteps.includes("payment") && (
                    <p className="mt-2 text-sm text-gray-600">
                      {paymentData.paymentMethod === "CREDIT_CARD"
                        ? `•••• •••• •••• ${paymentData.cardNumber.slice(-4)}`
                        : "PayPal"}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {completedSteps.includes("payment") &&
                    currentStep !== "payment" && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentStep("payment");
                          setExpandedSections({
                            shipping: false,
                            payment: true,
                            review: false,
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentStep("payment");
                            setExpandedSections({
                              shipping: false,
                              payment: true,
                              review: false,
                            });
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                        role="button"
                        tabIndex={0}
                      >
                        Edit
                      </div>
                    )}
                  {expandedSections.payment ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedSections.payment && (
                <div id="payment-content" className="px-6 pb-6 border-t">
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Method
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="CREDIT_CARD"
                            checked={
                              paymentData.paymentMethod === "CREDIT_CARD"
                            }
                            onChange={(e) =>
                              setPaymentData({
                                ...paymentData,
                                paymentMethod: e.target.value as PaymentMethod,
                              })
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <CreditCard className="ml-3 h-5 w-5 text-gray-600" />
                          <span className="ml-2 text-sm font-medium">
                            Credit/Debit Card
                          </span>
                        </label>

                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="PAYPAL"
                            checked={paymentData.paymentMethod === "PAYPAL"}
                            onChange={(e) =>
                              setPaymentData({
                                ...paymentData,
                                paymentMethod: e.target.value as PaymentMethod,
                              })
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-5 text-sm font-medium">
                            PayPal
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Credit Card Fields */}
                    {paymentData.paymentMethod === "CREDIT_CARD" && (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Holder Name
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={paymentData.cardHolderName}
                            onChange={(e) =>
                              setPaymentData({
                                ...paymentData,
                                cardHolderName: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={paymentData.cardNumber}
                            onChange={(e) =>
                              setPaymentData({
                                ...paymentData,
                                cardNumber: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Month
                            </label>
                            <select
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={paymentData.expiryMonth}
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  expiryMonth: e.target.value,
                                })
                              }
                            >
                              <option value="">MM</option>
                              {[...Array(12)].map((_, i) => (
                                <option
                                  key={i}
                                  value={String(i + 1).padStart(2, "0")}
                                >
                                  {String(i + 1).padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Year
                            </label>
                            <select
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={paymentData.expiryYear}
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  expiryYear: e.target.value,
                                })
                              }
                            >
                              <option value="">YY</option>
                              {[...Array(10)].map((_, i) => (
                                <option
                                  key={i}
                                  value={String(2025 + i).slice(-2)}
                                >
                                  {2025 + i}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={paymentData.cvv}
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  cvv: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="save-card"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={paymentData.saveCard}
                            onChange={(e) =>
                              setPaymentData({
                                ...paymentData,
                                saveCard: e.target.checked,
                              })
                            }
                          />
                          <label
                            htmlFor="save-card"
                            className="ml-2 text-sm text-gray-600"
                          >
                            Save this card for future purchases
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Continue to Review
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Order Review */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div
                onClick={() => toggleSection("review")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSection("review");
                  }
                }}
                className="w-full p-6 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                role="button"
                tabIndex={0}
                aria-expanded={expandedSections.review}
                aria-controls="review-content"
              >
                <div>
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Review Order
                    </h3>
                    {completedSteps.includes("review") && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Review your order details before placing
                  </p>
                </div>
                {expandedSections.review ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {expandedSections.review && (
                <div
                  id="review-content"
                  className="px-6 pb-6 border-t space-y-6"
                >
                  {/* Shipping Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Shipping Address
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900 font-medium">
                        {shippingData.firstName} {shippingData.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {shippingData.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        {shippingData.street}
                        <br />
                        {shippingData.city}, {shippingData.state}{" "}
                        {shippingData.zipCode}
                      </p>
                    </div>
                    <div className="flex justify-end mt-2">
                      <div
                        onClick={() => {
                          setCurrentStep("shipping");
                          setExpandedSections({
                            shipping: true,
                            payment: false,
                            review: false,
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setCurrentStep("shipping");
                            setExpandedSections({
                              shipping: true,
                              payment: false,
                              review: false,
                            });
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                        role="button"
                        tabIndex={0}
                      >
                        Edit
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Payment Method
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-900 font-medium">
                            {paymentData.paymentMethod === "CREDIT_CARD"
                              ? `Credit Card ending in ${paymentData.cardNumber.slice(
                                  -4
                                )}`
                              : "PayPal"}
                          </p>
                          {paymentData.paymentMethod === "CREDIT_CARD" && (
                            <p className="text-sm text-gray-600">
                              {paymentData.cardHolderName}
                            </p>
                          )}
                        </div>
                        <div
                          onClick={() => {
                            setCurrentStep("payment");
                            setExpandedSections({
                              shipping: false,
                              payment: true,
                              review: false,
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setCurrentStep("payment");
                              setExpandedSections({
                                shipping: false,
                                payment: true,
                                review: false,
                              });
                            }
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                          role="button"
                          tabIndex={0}
                        >
                          Edit
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {mockCartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms and Place Order */}
                  <div className="border-t pt-4">
                    <div className="flex items-start space-x-2 mb-4">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Lock className="h-5 w-5" />
                        <span>
                          {isPlacingOrder
                            ? "Placing Order..."
                            : `Place Order - $${total.toFixed(2)}`}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border sticky top-8">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {mockCartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      ${shippingCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">
                      Secure Checkout
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Your payment information is encrypted and secure
                  </p>
                </div>

                {/* Trust Signals */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>Easy 30-day returns</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="h-4 w-4" />
                    <span>4.9/5 customer satisfaction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success State */}
      {currentStep === "success" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Order Placed Successfully!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Your order #ORD-2025-001 has been confirmed and will be
                processed shortly. You'll receive a confirmation email soon.
              </p>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Track Order
                </button>
                <button
                  onClick={() => setCurrentStep("shipping")}
                  className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
