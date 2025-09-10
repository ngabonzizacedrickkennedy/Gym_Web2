// src/context/EnhancedCartContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { cartService, Cart, AddToCartRequest } from "@/services/cartService";
import { toast } from "react-toastify";

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isCartOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  refreshCart: () => Promise<void>;
  validateCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function EnhancedCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Calculate derived values
  const totalItems = cart?.totalItems || 0;
  const totalPrice = cart?.totalPrice || 0;

  // Load user's cart when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshCart();
    } else {
      // Clear cart data when not authenticated
      setCart(null);
    }
  }, [isAuthenticated, user]);

  // Refresh cart from backend
  const refreshCart = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const userCart = await cartService.getUserCart();
      setCart(userCart);
    } catch (error: any) {
      // Don't show error for 404 (empty cart)
      if (error?.response?.status !== 404) {
        console.error("Error loading cart:", error);
        toast.error("Failed to load cart");
      }
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addItem = async (productId: number, quantity: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      return;
    }

    try {
      setIsLoading(true);
      const request: AddToCartRequest = { productId, quantity };
      const updatedCart = await cartService.addToCart(request);
      setCart(updatedCart);
      toast.success(`Item added to cart`);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to add item to cart";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: number, quantity: number) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const updatedCart = await cartService.updateCartItemQuantity(
        productId,
        quantity
      );
      setCart(updatedCart);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to update quantity";
      toast.error(message);
      // Refresh cart to sync with backend state
      await refreshCart();
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId: number) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const updatedCart = await cartService.removeFromCart(productId);
      setCart(updatedCart);
      toast.success("Item removed from cart");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to remove item";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await cartService.clearCart();
      setCart(null);
      toast.success("Cart cleared");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to clear cart";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate cart
  const validateCart = async (): Promise<boolean> => {
    if (!isAuthenticated || !cart) return true;

    try {
      const result = await cartService.validateCart();
      if (!result.valid) {
        toast.warning(
          "Some items in your cart are no longer available. Please review your cart."
        );
        await refreshCart();
      }
      return result.valid;
    } catch (error) {
      console.error("Error validating cart:", error);
      return false;
    }
  };

  // Toggle cart visibility
  const toggleCart = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to view your cart");
      return;
    }
    setIsCartOpen((prev) => !prev);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartOpen,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        refreshCart,
        validateCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useEnhancedCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error(
      "useEnhancedCart must be used within an EnhancedCartProvider"
    );
  }
  return context;
}
