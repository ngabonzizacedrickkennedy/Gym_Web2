// src/app/checkout/page.tsx
"use client";

import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { EnhancedCartDrawer } from "@/components/cart/EnhancedCartDrawer";

export default function CheckoutPage() {
  return (
    <>
      <CheckoutSteps currentStep={"shipping"} completedSteps={[]} />
      <EnhancedCartDrawer />
    </>
  );
}
