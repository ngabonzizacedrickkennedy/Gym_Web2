// src/app/checkout/layout.tsx
import { EnhancedCartProvider } from "@/context/EnhancedCartContext";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EnhancedCartProvider>{children}</EnhancedCartProvider>;
}
