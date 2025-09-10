// src/app/checkout/page.tsx
"use client";

import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { EnhancedCartDrawer } from "@/components/shop/EnhancedCartDrawer";

export default function CheckoutPage() {
  return (
    <>
      <CheckoutFlow />
      <EnhancedCartDrawer />
    </>
  );
}
