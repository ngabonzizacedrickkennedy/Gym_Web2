// src/components/checkout/PaymentForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckoutRequest } from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Wallet,
  Truck,
  DollarSign,
  Lock,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

// Validation schema for payment form
const paymentSchema = z
  .object({
    paymentMethod: z.enum([
      "CREDIT_CARD",
      "DEBIT_CARD",
      "PAYPAL",
      "DIGITAL_WALLET",
      "CASH_ON_DELIVERY",
    ]),
    cardNumber: z.string().optional(),
    cardHolderName: z.string().optional(),
    expiryMonth: z.number().min(1).max(12).optional(),
    expiryYear: z.number().min(2024).max(2034).optional(),
    cvv: z.string().min(3).max(4).optional(),
    paypalEmail: z.string().email().optional(),
    walletType: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate card details when credit/debit card is selected
    if (
      data.paymentMethod === "CREDIT_CARD" ||
      data.paymentMethod === "DEBIT_CARD"
    ) {
      if (!data.cardNumber || data.cardNumber.replace(/\s/g, "").length < 13) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cardNumber"],
          message: "Valid card number is required",
        });
      }
      if (!data.cardHolderName || data.cardHolderName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cardHolderName"],
          message: "Cardholder name is required",
        });
      }
      if (!data.expiryMonth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expiryMonth"],
          message: "Expiry month is required",
        });
      }
      if (!data.expiryYear) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expiryYear"],
          message: "Expiry year is required",
        });
      }
      if (!data.cvv || data.cvv.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cvv"],
          message: "Valid CVV is required",
        });
      }
    }

    // Validate PayPal email
    if (
      data.paymentMethod === "PAYPAL" &&
      (!data.paypalEmail || !data.paypalEmail.includes("@"))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paypalEmail"],
        message: "Valid PayPal email is required",
      });
    }

    // Validate wallet type
    if (data.paymentMethod === "DIGITAL_WALLET" && !data.walletType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["walletType"],
        message: "Please select a wallet type",
      });
    }
  });

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSubmit: (
    paymentMethod: CheckoutRequest["paymentMethod"],
    paymentDetails?: CheckoutRequest["paymentDetails"]
  ) => void;
  initialData?: {
    paymentMethod?: CheckoutRequest["paymentMethod"];
    paymentDetails?: CheckoutRequest["paymentDetails"];
  };
}

export function PaymentForm({ onSubmit, initialData }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<
    CheckoutRequest["paymentMethod"]
  >(initialData?.paymentMethod || "CREDIT_CARD");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: selectedMethod,
      cardNumber: initialData?.paymentDetails?.cardNumber || "",
      cardHolderName: initialData?.paymentDetails?.cardHolderName || "",
      expiryMonth: initialData?.paymentDetails?.expiryMonth || undefined,
      expiryYear: initialData?.paymentDetails?.expiryYear || undefined,
      cvv: initialData?.paymentDetails?.cvv || "",
      paypalEmail: initialData?.paymentDetails?.paypalEmail || "",
      walletType: initialData?.paymentDetails?.walletType || "",
    },
    mode: "onChange",
  });

  const paymentMethod = watch("paymentMethod");

  const handlePaymentMethodChange = (
    method: CheckoutRequest["paymentMethod"]
  ) => {
    setSelectedMethod(method);
    setValue("paymentMethod", method);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setValue("cardNumber", formatted);
  };

  const onFormSubmit = (data: PaymentFormData) => {
    const paymentDetails: CheckoutRequest["paymentDetails"] = {};

    if (
      data.paymentMethod === "CREDIT_CARD" ||
      data.paymentMethod === "DEBIT_CARD"
    ) {
      paymentDetails.cardNumber = data.cardNumber?.replace(/\s/g, "");
      paymentDetails.cardHolderName = data.cardHolderName;
      paymentDetails.expiryMonth = data.expiryMonth;
      paymentDetails.expiryYear = data.expiryYear;
      paymentDetails.cvv = data.cvv;
    } else if (data.paymentMethod === "PAYPAL") {
      paymentDetails.paypalEmail = data.paypalEmail;
    } else if (data.paymentMethod === "DIGITAL_WALLET") {
      paymentDetails.walletType = data.walletType;
    }

    onSubmit(
      data.paymentMethod,
      data.paymentMethod === "CASH_ON_DELIVERY" ? undefined : paymentDetails
    );
    toast.success("Payment method saved!");
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Method Selection */}
          <RadioGroup
            value={paymentMethod}
            onValueChange={handlePaymentMethodChange}
          >
            {/* Credit Card */}
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="CREDIT_CARD" id="credit-card" />
              <Label
                htmlFor="credit-card"
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <CreditCard className="h-4 w-4" />
                Credit Card
              </Label>
            </div>

            {/* Debit Card */}
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="DEBIT_CARD" id="debit-card" />
              <Label
                htmlFor="debit-card"
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <CreditCard className="h-4 w-4" />
                Debit Card
              </Label>
            </div>

            {/* PayPal */}
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="PAYPAL" id="paypal" />
              <Label
                htmlFor="paypal"
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <Wallet className="h-4 w-4 text-blue-600" />
                PayPal
              </Label>
            </div>

            {/* Digital Wallet */}
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="DIGITAL_WALLET" id="digital-wallet" />
              <Label
                htmlFor="digital-wallet"
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <Wallet className="h-4 w-4 text-green-600" />
                Digital Wallet
              </Label>
            </div>

            {/* Cash on Delivery */}
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="CASH_ON_DELIVERY" id="cash-delivery" />
              <Label
                htmlFor="cash-delivery"
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <Truck className="h-4 w-4 text-orange-600" />
                Cash on Delivery
              </Label>
            </div>
          </RadioGroup>

          <Separator />

          {/* Card Details (for Credit/Debit Cards) */}
          {(paymentMethod === "CREDIT_CARD" ||
            paymentMethod === "DEBIT_CARD") && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="h-4 w-4" />
                Your card details are secure and encrypted
              </div>

              {/* Card Number */}
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  {...register("cardNumber")}
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  onChange={handleCardNumberChange}
                />
                {errors.cardNumber && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.cardNumber.message}
                  </p>
                )}
              </div>

              {/* Cardholder Name */}
              <div className="space-y-2">
                <Label htmlFor="cardHolderName">Cardholder Name</Label>
                <Input
                  {...register("cardHolderName")}
                  id="cardHolderName"
                  placeholder="John Doe"
                />
                {errors.cardHolderName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.cardHolderName.message}
                  </p>
                )}
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Month</Label>
                  <select
                    {...register("expiryMonth", { valueAsNumber: true })}
                    id="expiryMonth"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {String(i + 1).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  {errors.expiryMonth && (
                    <p className="text-xs text-red-600">
                      {errors.expiryMonth.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Year</Label>
                  <select
                    {...register("expiryYear", { valueAsNumber: true })}
                    id="expiryYear"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">YY</option>
                    {Array.from({ length: 11 }, (_, i) => (
                      <option key={2024 + i} value={2024 + i}>
                        {2024 + i}
                      </option>
                    ))}
                  </select>
                  {errors.expiryYear && (
                    <p className="text-xs text-red-600">
                      {errors.expiryYear.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    {...register("cvv")}
                    id="cvv"
                    placeholder="123"
                    maxLength={4}
                    type="password"
                  />
                  {errors.cvv && (
                    <p className="text-xs text-red-600">{errors.cvv.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PayPal Email */}
          {paymentMethod === "PAYPAL" && (
            <div className="space-y-2">
              <Label htmlFor="paypalEmail">PayPal Email</Label>
              <Input
                {...register("paypalEmail")}
                id="paypalEmail"
                type="email"
                placeholder="your-email@paypal.com"
              />
              {errors.paypalEmail && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.paypalEmail.message}
                </p>
              )}
            </div>
          )}

          {/* Digital Wallet */}
          {paymentMethod === "DIGITAL_WALLET" && (
            <div className="space-y-2">
              <Label htmlFor="walletType">Wallet Type</Label>
              <select
                {...register("walletType")}
                id="walletType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select wallet type</option>
                <option value="apple_pay">Apple Pay</option>
                <option value="google_pay">Google Pay</option>
                <option value="samsung_pay">Samsung Pay</option>
              </select>
              {errors.walletType && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.walletType.message}
                </p>
              )}
            </div>
          )}

          {/* Cash on Delivery Notice */}
          {paymentMethod === "CASH_ON_DELIVERY" && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <DollarSign className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">
                    Cash on Delivery
                  </h4>
                  <p className="text-sm text-orange-700">
                    You will pay for your order when it's delivered to your
                    address. Please have the exact amount ready.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={!isValid}>
        Continue to Review
      </Button>
    </form>
  );
}
