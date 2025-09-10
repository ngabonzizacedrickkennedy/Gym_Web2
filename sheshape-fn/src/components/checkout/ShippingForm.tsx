// src/components/checkout/ShippingForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Address } from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";

// Validation schema for shipping address
const addressSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[(]?[\d\s\-\(\)]{10,}$/, "Please enter a valid phone number"),
  street: z
    .string()
    .min(5, "Street address must be at least 5 characters")
    .max(200),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  state: z
    .string()
    .min(2, "State/Province must be at least 2 characters")
    .max(100),
  zipCode: z
    .string()
    .min(3, "ZIP/Postal code must be at least 3 characters")
    .max(20),
  country: z.string().min(2, "Please select a country"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  useSameForBilling: z.boolean().default(true),
});

// Billing address schema (optional if using same as shipping)
const billingAddressSchema = z
  .object({
    billingFirstName: z.string().optional(),
    billingLastName: z.string().optional(),
    billingPhone: z.string().optional(),
    billingStreet: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    billingZipCode: z.string().optional(),
    billingCountry: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Add validation when billing address is different
    const fields = [
      { field: "billingFirstName", name: "First name", min: 2 },
      { field: "billingLastName", name: "Last name", min: 2 },
      { field: "billingPhone", name: "Phone", min: 10 },
      { field: "billingStreet", name: "Street", min: 5 },
      { field: "billingCity", name: "City", min: 2 },
      { field: "billingState", name: "State", min: 2 },
      { field: "billingZipCode", name: "ZIP Code", min: 3 },
      { field: "billingCountry", name: "Country", min: 2 },
    ];

    fields.forEach(({ field, name, min }) => {
      const value = data[field as keyof typeof data];
      if (!value || value.length < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: `${name} is required and must be at least ${min} characters`,
        });
      }
    });
  });

const fullFormSchema = addressSchema.and(billingAddressSchema);

type ShippingFormData = z.infer<typeof fullFormSchema>;

interface ShippingFormProps {
  onSubmit: (
    shippingAddress: Address,
    billingAddress: Address | null,
    notes: string,
    useSameAddress: boolean
  ) => void;
  initialData?: {
    shippingAddress?: Address;
    billingAddress?: Address;
    notes?: string;
    useSameAddress?: boolean;
  };
}

// Country list - in a real app, this would come from an API
const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "RW", name: "Rwanda" },
  // Add more countries as needed
];

export function ShippingForm({ onSubmit, initialData }: ShippingFormProps) {
  const { user } = useAuth();
  const [useSameForBilling, setUseSameForBilling] = useState(
    initialData?.useSameAddress ?? true
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(fullFormSchema),
    defaultValues: {
      firstName:
        initialData?.shippingAddress?.firstName ||
        user?.profile?.firstName ||
        "",
      lastName:
        initialData?.shippingAddress?.lastName || user?.profile?.lastName || "",
      phone:
        initialData?.shippingAddress?.phone || user?.profile?.phoneNumber || "",
      street: initialData?.shippingAddress?.street || "",
      city: initialData?.shippingAddress?.city || "",
      state: initialData?.shippingAddress?.state || "",
      zipCode: initialData?.shippingAddress?.zipCode || "",
      country: initialData?.shippingAddress?.country || "RW",
      notes: initialData?.notes || "",
      useSameForBilling: useSameForBilling,
      billingFirstName: initialData?.billingAddress?.firstName || "",
      billingLastName: initialData?.billingAddress?.lastName || "",
      billingPhone: initialData?.billingAddress?.phone || "",
      billingStreet: initialData?.billingAddress?.street || "",
      billingCity: initialData?.billingAddress?.city || "",
      billingState: initialData?.billingAddress?.state || "",
      billingZipCode: initialData?.billingAddress?.zipCode || "",
      billingCountry: initialData?.billingAddress?.country || "RW",
    },
    mode: "onChange",
  });

  const handleUseSameForBillingChange = (checked: boolean) => {
    setUseSameForBilling(checked);
    setValue("useSameForBilling", checked);
  };

  const onFormSubmit = (data: ShippingFormData) => {
    const shippingAddress: Address = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      street: data.street,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
    };

    let billingAddress: Address | null = null;

    if (!useSameForBilling) {
      billingAddress = {
        firstName: data.billingFirstName!,
        lastName: data.billingLastName!,
        phone: data.billingPhone!,
        street: data.billingStreet!,
        city: data.billingCity!,
        state: data.billingState!,
        zipCode: data.billingZipCode!,
        country: data.billingCountry!,
      };
    }

    onSubmit(
      shippingAddress,
      billingAddress,
      data.notes || "",
      useSameForBilling
    );
    toast.success("Shipping information saved!");
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  {...register("firstName")}
                  id="firstName"
                  placeholder="John"
                  className="pl-10"
                />
              </div>
              {errors.firstName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  {...register("lastName")}
                  id="lastName"
                  placeholder="Doe"
                  className="pl-10"
                />
              </div>
              {errors.lastName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                {...register("phone")}
                id="phone"
                type="tel"
                placeholder="+250 123 456 789"
                className="pl-10"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Street Address */}
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                {...register("street")}
                id="street"
                placeholder="123 Main Street, Apartment 4B"
                className="pl-10"
              />
            </div>
            {errors.street && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.street.message}
              </p>
            )}
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input {...register("city")} id="city" placeholder="Kigali" />
              {errors.city && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                {...register("state")}
                id="state"
                placeholder="Kigali City"
              />
              {errors.state && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.state.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP/Postal Code</Label>
              <Input
                {...register("zipCode")}
                id="zipCode"
                placeholder="00100"
              />
              {errors.zipCode && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.zipCode.message}
                </p>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <select
              {...register("country")}
              id="country"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.country.message}
              </p>
            )}
          </div>

          {/* Delivery Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Delivery Notes (Optional)</Label>
            <Textarea
              {...register("notes")}
              id="notes"
              placeholder="Special delivery instructions, building access codes, etc."
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.notes.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Billing Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Same as Shipping Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useSameForBilling"
              checked={useSameForBilling}
              onCheckedChange={handleUseSameForBillingChange}
            />
            <Label htmlFor="useSameForBilling" className="cursor-pointer">
              Use same address for billing
            </Label>
          </div>

          {/* Billing Address Fields (shown when different from shipping) */}
          {!useSameForBilling && (
            <>
              <Separator className="my-4" />

              {/* Billing Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingFirstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      {...register("billingFirstName")}
                      id="billingFirstName"
                      placeholder="John"
                      className="pl-10"
                    />
                  </div>
                  {errors.billingFirstName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.billingFirstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingLastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      {...register("billingLastName")}
                      id="billingLastName"
                      placeholder="Doe"
                      className="pl-10"
                    />
                  </div>
                  {errors.billingLastName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.billingLastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Billing Phone */}
              <div className="space-y-2">
                <Label htmlFor="billingPhone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...register("billingPhone")}
                    id="billingPhone"
                    type="tel"
                    placeholder="+250 123 456 789"
                    className="pl-10"
                  />
                </div>
                {errors.billingPhone && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.billingPhone.message}
                  </p>
                )}
              </div>

              {/* Billing Street Address */}
              <div className="space-y-2">
                <Label htmlFor="billingStreet">Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...register("billingStreet")}
                    id="billingStreet"
                    placeholder="123 Main Street, Apartment 4B"
                    className="pl-10"
                  />
                </div>
                {errors.billingStreet && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.billingStreet.message}
                  </p>
                )}
              </div>

              {/* Billing City, State, ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingCity">City</Label>
                  <Input
                    {...register("billingCity")}
                    id="billingCity"
                    placeholder="Kigali"
                  />
                  {errors.billingCity && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.billingCity.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingState">State/Province</Label>
                  <Input
                    {...register("billingState")}
                    id="billingState"
                    placeholder="Kigali City"
                  />
                  {errors.billingState && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.billingState.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingZipCode">ZIP/Postal Code</Label>
                  <Input
                    {...register("billingZipCode")}
                    id="billingZipCode"
                    placeholder="00100"
                  />
                  {errors.billingZipCode && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.billingZipCode.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Billing Country */}
              <div className="space-y-2">
                <Label htmlFor="billingCountry">Country</Label>
                <select
                  {...register("billingCountry")}
                  id="billingCountry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.billingCountry && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.billingCountry.message}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={!isValid}>
        <Save className="mr-2 h-4 w-4" />
        Continue to Payment
      </Button>
    </form>
  );
}
