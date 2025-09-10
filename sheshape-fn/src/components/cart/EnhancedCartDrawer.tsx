// src/components/cart/EnhancedCartDrawer.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEnhancedCart } from "@/context/EnhancedCartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  Plus,
  Minus,
  X,
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  Trash2,
  AlertCircle,
  Package,
  CreditCard,
} from "lucide-react";
import { toast } from "react-toastify";

interface EnhancedCartDrawerProps {
  children?: React.ReactNode; // For trigger button
}

export function EnhancedCartDrawer({ children }: EnhancedCartDrawerProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const { isAuthenticated } = useAuth();
  const {
    cart,
    isLoading,
    isCartOpen,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
    toggleCart,
    validateCart,
  } = useEnhancedCart();

  const router = useRouter();

  const handleQuantityChange = async (
    productId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    setUpdatingItemId(productId);
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      // Error is handled in context
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    setUpdatingItemId(productId);
    try {
      await removeItem(productId);
    } catch (error) {
      // Error is handled in context
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearDialog(false);
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push("/login?returnTo=/checkout");
      return;
    }

    // Validate cart before proceeding
    const isValid = await validateCart();
    if (!isValid) {
      toast.error("Please review your cart and try again");
      return;
    }

    toggleCart(); // Close drawer
    router.push("/checkout");
  };

  const CartTriggerButton = () => (
    <button
      onClick={toggleCart}
      className="relative p-2 text-neutral-700 hover:text-primary transition-colors"
      aria-label={`Shopping Cart (${totalItems} items)`}
    >
      <ShoppingCart size={20} />
      {totalItems > 0 && (
        <Badge
          variant="default"
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {totalItems > 99 ? "99+" : totalItems}
        </Badge>
      )}
    </button>
  );

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={toggleCart}>
        <SheetTrigger asChild>{children || <CartTriggerButton />}</SheetTrigger>

        <SheetContent
          side="right"
          className="w-full sm:max-w-lg flex flex-col h-full"
        >
          <SheetHeader className="space-y-2.5 pr-6">
            <SheetTitle className="flex items-center text-left">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Shopping Cart
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </Badge>
              )}
            </SheetTitle>
            {totalItems > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total: {formatPrice(totalPrice)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearDialog(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Cart
                </Button>
              </div>
            )}
          </SheetHeader>

          {/* Loading State */}
          {isLoading && !cart && (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* Authentication Required */}
          {!isAuthenticated && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <ShoppingBag className="h-16 w-16 text-neutral-300 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Login Required
              </h3>
              <p className="text-neutral-600 mb-6">
                Please log in to view and manage your cart items.
              </p>
              <Button onClick={() => router.push("/login")} className="w-full">
                Log In
              </Button>
            </div>
          )}

          {/* Empty Cart */}
          {isAuthenticated && (!cart?.items?.length || totalItems === 0) && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <ShoppingBag className="h-16 w-16 text-neutral-300 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-neutral-600 mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button onClick={toggleCart} asChild className="w-full">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          )}

          {/* Cart Items */}
          {isAuthenticated && cart?.items && cart.items.length > 0 && (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4 pr-6">
                  {cart.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg relative"
                    >
                      {/* Loading Overlay */}
                      {updatingItemId === item.product.id && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                        {item.product.images &&
                        item.product.images.length > 0 ? (
                          <Image
                            src={
                              item.product.images.find((img) => img.isMain)
                                ?.imageUrl || item.product.images[0].imageUrl
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-6 w-6 text-neutral-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 line-clamp-2 mb-1">
                          {item.product.name}
                        </h4>

                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-neutral-600">
                            <span>
                              {formatPrice(
                                item.product.discountPrice || item.product.price
                              )}
                            </span>
                            {item.product.discountPrice && (
                              <span className="ml-2 line-through text-neutral-400">
                                {formatPrice(item.product.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                updatingItemId === item.product.id ||
                                item.quantity <= 1
                              }
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                updatingItemId === item.product.id ||
                                item.quantity >= item.product.inventoryCount
                              }
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            disabled={updatingItemId === item.product.id}
                            className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
                            aria-label="Remove item"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Stock Warning */}
                        {item.quantity >= item.product.inventoryCount && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                            <AlertCircle className="h-3 w-3" />
                            <span>Max quantity available</span>
                          </div>
                        )}
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-medium text-neutral-900">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Footer */}
              <div className="border-t pt-4 pr-6 space-y-4">
                {/* Cart Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-base font-medium">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Shipping and taxes will be calculated at checkout.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                    disabled={isLoading || totalItems === 0}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Proceed to Checkout
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={toggleCart}
                    asChild
                    className="w-full"
                  >
                    <Link href="/shop">Continue Shopping</Link>
                  </Button>
                </div>

                {/* Quick Links */}
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={toggleCart}
                    asChild
                    className="text-sm text-neutral-600"
                  >
                    <Link href="/cart">
                      View Full Cart
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Clear Cart Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Shopping Cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove all items from your cart. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCart}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
