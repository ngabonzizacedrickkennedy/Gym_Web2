// src/components/checkout/ShippingForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Address } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

interface ShippingFormProps {
  shippingAddress: Address | null;
  billingAddress: Address | null;
  useSameAddress: boolean;
  onUpdate: (updates: {
    shippingAddress?: Address;
    billingAddress?: Address;
    useSameAddress?: boolean;
    notes?: string;
  }) => void;
}

export function ShippingForm({
  shippingAddress,
  billingAddress,
  useSameAddress,
  onUpdate,
}: ShippingFormProps) {
  const {
    register: registerShipping,
    handleSubmit: handleSubmitShipping,
    formState: { errors: shippingErrors },
    watch: watchShipping,
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: shippingAddress || {
      firstName: "",
      lastName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
  });

  const {
    register: registerBilling,
    handleSubmit: handleSubmitBilling,
    formState: { errors: billingErrors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: billingAddress || {
      firstName: "",
      lastName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
  });

  const handleShippingSubmit = (data: any) => {
    onUpdate({ shippingAddress: data as Address });
  };

  const handleBillingSubmit = (data: any) => {
    onUpdate({ billingAddress: data as Address });
  };

  const handleSameAddressChange = (checked: boolean) => {
    onUpdate({ useSameAddress: checked });
  };

  return (
    <div className="space-y-8">
      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
        <form
          onSubmit={handleSubmitShipping(handleShippingSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shipping-firstName">First Name</Label>
              <Input
                id="shipping-firstName"
                {...registerShipping("firstName")}
                onChange={(e) => {
                  registerShipping("firstName").onChange(e);
                  handleShippingSubmit(watchShipping());
                }}
              />
              {shippingErrors.firstName && (
                <p className="text-sm text-red-600">
                  {shippingErrors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="shipping-lastName">Last Name</Label>
              <Input
                id="shipping-lastName"
                {...registerShipping("lastName")}
                onChange={(e) => {
                  registerShipping("lastName").onChange(e);
                  handleShippingSubmit(watchShipping());
                }}
              />
              {shippingErrors.lastName && (
                <p className="text-sm text-red-600">
                  {shippingErrors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="shipping-phone">Phone Number</Label>
            <Input
              id="shipping-phone"
              type="tel"
              {...registerShipping("phone")}
              onChange={(e) => {
                registerShipping("phone").onChange(e);
                handleShippingSubmit(watchShipping());
              }}
            />
            {shippingErrors.phone && (
              <p className="text-sm text-red-600">
                {shippingErrors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="shipping-street">Street Address</Label>
            <Input
              id="shipping-street"
              {...registerShipping("street")}
              onChange={(e) => {
                registerShipping("street").onChange(e);
                handleShippingSubmit(watchShipping());
              }}
            />
            {shippingErrors.street && (
              <p className="text-sm text-red-600">
                {shippingErrors.street.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shipping-city">City</Label>
              <Input
                id="shipping-city"
                {...registerShipping("city")}
                onChange={(e) => {
                  registerShipping("city").onChange(e);
                  handleShippingSubmit(watchShipping());
                }}
              />
              {shippingErrors.city && (
                <p className="text-sm text-red-600">
                  {shippingErrors.city.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="shipping-state">State</Label>
              <Input
                id="shipping-state"
                {...registerShipping("state")}
                onChange={(e) => {
                  registerShipping("state").onChange(e);
                  handleShippingSubmit(watchShipping());
                }}
              />
              {shippingErrors.state && (
                <p className="text-sm text-red-600">
                  {shippingErrors.state.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shipping-zipCode">ZIP Code</Label>
              <Input
                id="shipping-zipCode"
                {...registerShipping("zipCode")}
                onChange={(e) => {
                  registerShipping("zipCode").onChange(e);
                  handleShippingSubmit(watchShipping());
                }}
              />
              {shippingErrors.zipCode && (
                <p className="text-sm text-red-600">
                  {shippingErrors.zipCode.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="shipping-country">Country</Label>
              <Input
                id="shipping-country"
                {...registerShipping("country")}
                onChange={(e) => {
                  registerShipping("country").onChange(e);
                  handleShippingSubmit(watchShipping());
                }}
              />
              {shippingErrors.country && (
                <p className="text-sm text-red-600">
                  {shippingErrors.country.message}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Billing Address Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="sameAddress"
          checked={useSameAddress}
          onCheckedChange={handleSameAddressChange}
        />
        <Label htmlFor="sameAddress">Use same address for billing</Label>
      </div>

      {/* Billing Address */}
      {!useSameAddress && (
        <div>
          <h3 className="text-lg font-medium mb-4">Billing Address</h3>
          <form
            onSubmit={handleSubmitBilling(handleBillingSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billing-firstName">First Name</Label>
                <Input
                  id="billing-firstName"
                  {...registerBilling("firstName")}
                  onChange={(e) => {
                    registerBilling("firstName").onChange(e);
                    handleBillingSubmit(watchShipping());
                  }}
                />
                {billingErrors.firstName && (
                  <p className="text-sm text-red-600">
                    {billingErrors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="billing-lastName">Last Name</Label>
                <Input
                  id="billing-lastName"
                  {...registerBilling("lastName")}
                  onChange={(e) => {
                    registerBilling("lastName").onChange(e);
                    handleBillingSubmit(watchShipping());
                  }}
                />
                {billingErrors.lastName && (
                  <p className="text-sm text-red-600">
                    {billingErrors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Similar fields as shipping address */}
            <div>
              <Label htmlFor="billing-phone">Phone Number</Label>
              <Input
                id="billing-phone"
                type="tel"
                {...registerBilling("phone")}
              />
            </div>

            <div>
              <Label htmlFor="billing-street">Street Address</Label>
              <Input id="billing-street" {...registerBilling("street")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billing-city">City</Label>
                <Input id="billing-city" {...registerBilling("city")} />
              </div>
              <div>
                <Label htmlFor="billing-state">State</Label>
                <Input id="billing-state" {...registerBilling("state")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billing-zipCode">ZIP Code</Label>
                <Input id="billing-zipCode" {...registerBilling("zipCode")} />
              </div>
              <div>
                <Label htmlFor="billing-country">Country</Label>
                <Input id="billing-country" {...registerBilling("country")} />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Order Notes */}
      <div>
        <Label htmlFor="notes">Order Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any special instructions for your order..."
          onChange={(e) => onUpdate({ notes: e.target.value })}
        />
      </div>
    </div>
  );
}

// src/components/checkout/PaymentForm.tsx
("use client");

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckoutRequest } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Banknote, Smartphone, Truck } from "lucide-react";

const paymentDetailsSchema = z.object({
  cardNumber: z.string().optional(),
  cardHolderName: z.string().optional(),
  expiryMonth: z.number().min(1).max(12).optional(),
  expiryYear: z.number().min(new Date().getFullYear()).optional(),
  cvv: z.string().length(3).optional(),
  paypalEmail: z.string().email().optional(),
  walletType: z.string().optional(),
});

interface PaymentFormProps {
  paymentMethod: CheckoutRequest["paymentMethod"] | null;
  paymentDetails: CheckoutRequest["paymentDetails"] | null;
  onUpdate: (updates: {
    paymentMethod?: CheckoutRequest["paymentMethod"];
    paymentDetails?: CheckoutRequest["paymentDetails"];
  }) => void;
}

export function PaymentForm({
  paymentMethod,
  paymentDetails,
  onUpdate,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<
    CheckoutRequest["paymentMethod"] | undefined
  >(paymentMethod || undefined);

  const {
    register,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(paymentDetailsSchema),
    defaultValues: paymentDetails || {},
  });

  const handleMethodChange = (method: CheckoutRequest["paymentMethod"]) => {
    setSelectedMethod(method);
    onUpdate({ paymentMethod: method });
  };

  const handleDetailsChange = () => {
    const formData = watch();
    onUpdate({ paymentDetails: formData });
  };

  const paymentMethods = [
    {
      id: "CREDIT_CARD" as const,
      name: "Credit Card",
      icon: CreditCard,
      description: "Pay with Visa, Mastercard, or American Express",
    },
    {
      id: "DEBIT_CARD" as const,
      name: "Debit Card",
      icon: CreditCard,
      description: "Pay directly from your bank account",
    },
    {
      id: "PAYPAL" as const,
      name: "PayPal",
      icon: Banknote,
      description: "Pay with your PayPal account",
    },
    {
      id: "DIGITAL_WALLET" as const,
      name: "Digital Wallet",
      icon: Smartphone,
      description: "Pay with Apple Pay, Google Pay, etc.",
    },
    {
      id: "CASH_ON_DELIVERY" as const,
      name: "Cash on Delivery",
      icon: Truck,
      description: "Pay when your order is delivered",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-medium mb-4">Select Payment Method</h3>
        <RadioGroup
          value={selectedMethod}
          onValueChange={handleMethodChange}
          className="space-y-3"
        >
          {paymentMethods.map((method) => (
            <div key={method.id}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id} className="flex-1">
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="flex items-center p-4">
                      <method.icon className="h-6 w-6 mr-3 text-gray-600" />
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-500">
                          {method.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Payment Details Forms */}
      {selectedMethod &&
        (selectedMethod === "CREDIT_CARD" ||
          selectedMethod === "DEBIT_CARD") && (
          <div>
            <h3 className="text-lg font-medium mb-4">Card Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardHolderName">Cardholder Name</Label>
                <Input
                  id="cardHolderName"
                  {...register("cardHolderName")}
                  onChange={(e) => {
                    register("cardHolderName").onChange(e);
                    handleDetailsChange();
                  }}
                  placeholder="John Doe"
                />
                {errors.cardHolderName && (
                  <p className="text-sm text-red-600">
                    {errors.cardHolderName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  {...register("cardNumber")}
                  onChange={(e) => {
                    register("cardNumber").onChange(e);
                    handleDetailsChange();
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                {errors.cardNumber && (
                  <p className="text-sm text-red-600">
                    {errors.cardNumber.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">Month</Label>
                  <Input
                    id="expiryMonth"
                    type="number"
                    min="1"
                    max="12"
                    {...register("expiryMonth", { valueAsNumber: true })}
                    onChange={(e) => {
                      register("expiryMonth").onChange(e);
                      handleDetailsChange();
                    }}
                    placeholder="MM"
                  />
                  {errors.expiryMonth && (
                    <p className="text-sm text-red-600">
                      {errors.expiryMonth.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="expiryYear">Year</Label>
                  <Input
                    id="expiryYear"
                    type="number"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 20}
                    {...register("expiryYear", { valueAsNumber: true })}
                    onChange={(e) => {
                      register("expiryYear").onChange(e);
                      handleDetailsChange();
                    }}
                    placeholder="YYYY"
                  />
                  {errors.expiryYear && (
                    <p className="text-sm text-red-600">
                      {errors.expiryYear.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    {...register("cvv")}
                    onChange={(e) => {
                      register("cvv").onChange(e);
                      handleDetailsChange();
                    }}
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors.cvv && (
                    <p className="text-sm text-red-600">{errors.cvv.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {selectedMethod === "PAYPAL" && (
        <div>
          <h3 className="text-lg font-medium mb-4">PayPal Information</h3>
          <div>
            <Label htmlFor="paypalEmail">PayPal Email</Label>
            <Input
              id="paypalEmail"
              type="email"
              {...register("paypalEmail")}
              onChange={(e) => {
                register("paypalEmail").onChange(e);
                handleDetailsChange();
              }}
              placeholder="your-email@example.com"
            />
            {errors.paypalEmail && (
              <p className="text-sm text-red-600">
                {errors.paypalEmail.message}
              </p>
            )}
          </div>
        </div>
      )}

      {selectedMethod === "DIGITAL_WALLET" && (
        <div>
          <h3 className="text-lg font-medium mb-4">Digital Wallet</h3>
          <div>
            <Label htmlFor="walletType">Wallet Type</Label>
            <select
              id="walletType"
              {...register("walletType")}
              onChange={(e) => {
                register("walletType").onChange(e);
                handleDetailsChange();
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select wallet type</option>
              <option value="apple_pay">Apple Pay</option>
              <option value="google_pay">Google Pay</option>
              <option value="samsung_pay">Samsung Pay</option>
            </select>
          </div>
        </div>
      )}

      {selectedMethod === "CASH_ON_DELIVERY" && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Cash on Delivery</h3>
          <p className="text-sm text-gray-600">
            You will pay for your order when it is delivered to your address.
            Please have the exact amount ready for the delivery person.
          </p>
        </div>
      )}
    </div>
  );
}

// src/components/checkout/CheckoutSteps.tsx
("use client");

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutStepsProps {
  currentStep: "shipping" | "payment" | "review" | "success";
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { id: "shipping", name: "Shipping", description: "Enter your address" },
    { id: "payment", name: "Payment", description: "Choose payment method" },
    { id: "review", name: "Review", description: "Review your order" },
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex((step) => step.id === stepId);
    const currentIndex = steps.findIndex((step) => step.id === currentStep);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
          const status = getStepStatus(step.id);

          return (
            <li
              key={step.id}
              className={cn(
                stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "",
                "relative"
              )}
            >
              {status === "completed" ? (
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-primary" />
                </div>
              ) : status === "current" ? (
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
              ) : (
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
              )}

              <a
                href="#"
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full",
                  status === "completed"
                    ? "bg-primary hover:bg-primary/90"
                    : status === "current"
                    ? "border-2 border-primary bg-white"
                    : "border-2 border-gray-300 bg-white hover:border-gray-400"
                )}
              >
                {status === "completed" ? (
                  <Check className="h-5 w-5 text-white" aria-hidden="true" />
                ) : (
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      status === "current" ? "bg-primary" : "bg-transparent"
                    )}
                  />
                )}
                <span className="sr-only">{step.name}</span>
              </a>

              <div className="mt-3">
                <p
                  className={cn(
                    "text-sm font-medium",
                    status === "current" ? "text-primary" : "text-gray-500"
                  )}
                >
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// src/components/checkout/OrderSummary.tsx
("use client");

import Image from "next/image";
import { Cart } from "@/services/cartService";
import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";

interface OrderSummaryProps {
  cart: Cart;
}

export function OrderSummary({ cart }: OrderSummaryProps) {
  if (!cart?.items?.length) {
    return (
      <div className="text-center py-8">
        <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No items in cart</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.product.id} className="flex items-center space-x-4">
            <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
              {item.product.images?.length ? (
                <Image
                  src={
                    item.product.images.find((img) => img.isMain)?.imageUrl ||
                    item.product.images[0].imageUrl
                  }
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gray-200">
                  <ShoppingBag className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                {item.product.name}
              </h4>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>

            <div className="text-sm font-medium text-gray-900">
              {formatPrice(
                (item.product.discountPrice || item.product.price) *
                  item.quantity
              )}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({cart.totalItems} items)</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>

        {cart.totalDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(cart.totalDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>Free</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>Calculated at checkout</span>
        </div>

        <Separator />

        <div className="flex justify-between text-base font-medium">
          <span>Total</span>
          <span>{formatPrice(cart.totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
