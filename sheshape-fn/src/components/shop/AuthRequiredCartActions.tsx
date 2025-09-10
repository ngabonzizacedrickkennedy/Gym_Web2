// src/components/shop/AuthRequiredCartActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEnhancedCart } from "@/context/EnhancedCartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Share,
  AlertCircle,
  CheckCircle,
  Package,
  User,
} from "lucide-react";
import { toast } from "react-toastify";

interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  inventoryCount: number;
  active: boolean;
  images?: Array<{
    id: number;
    imageUrl: string;
    isMain: boolean;
  }>;
}

interface AuthRequiredCartActionsProps {
  product: Product;
  className?: string;
}

export function AuthRequiredCartActions({
  product,
  className,
}: AuthRequiredCartActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addItem, isLoading } = useEnhancedCart();
  const router = useRouter();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.inventoryCount) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    if (!product.active || product.inventoryCount === 0) {
      toast.error("This product is currently unavailable");
      return;
    }

    try {
      await addItem(product.id, quantity);
      setQuantity(1); // Reset quantity after successful add
    } catch (error) {
      // Error is already handled in the cart context
      console.error("Failed to add to cart:", error);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginDialog(false);
    router.push(
      `/login?returnTo=${encodeURIComponent(window.location.pathname)}`
    );
  };

  const getStockStatus = () => {
    if (product.inventoryCount === 0) {
      return {
        status: "Out of Stock",
        variant: "destructive" as const,
        icon: AlertCircle,
        disabled: true,
      };
    } else if (product.inventoryCount <= 5) {
      return {
        status: `Only ${product.inventoryCount} left`,
        variant: "secondary" as const,
        icon: Package,
        disabled: false,
      };
    } else {
      return {
        status: "In Stock",
        variant: "default" as const,
        icon: CheckCircle,
        disabled: false,
      };
    }
  };

  const stockStatus = getStockStatus();
  const isOutOfStock = product.inventoryCount === 0 || !product.active;

  return (
    <div className={className}>
      {/* Stock Status */}
      <div className="flex items-center gap-2 mb-4">
        <stockStatus.icon className="h-4 w-4" />
        <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
      </div>

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min="1"
              max={product.inventoryCount}
              value={quantity}
              onChange={(e) =>
                handleQuantityChange(parseInt(e.target.value) || 1)
              }
              className="h-8 w-16 text-center border-0 focus:ring-0"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.inventoryCount}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Adding to Cart...
            </>
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>

        {/* Secondary Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </Button>
          <Button variant="outline" className="flex-1">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Login Required Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Login Required
            </DialogTitle>
            <DialogDescription>
              You need to be logged in to add items to your cart. Please log in
              or create an account to continue shopping.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLoginRedirect}>Log In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
