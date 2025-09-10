// src/services/cartService.ts
import { api } from '@/lib/api';

export interface CartItem {
  product: {
    id: number;
    name: string;
    price: number;
    discountPrice?: number;
    images: Array<{
      id: number;
      imageUrl: string;
      isMain: boolean;
    }>;
    inventoryCount: number;
    active: boolean;
  };
  quantity: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  totalDiscount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

class CartService {
  // Get current user's cart
  async getUserCart(): Promise<Cart> {
    const response = await api.get('/api/cart');
    return response.data;
  }

  // Add item to cart
  async addToCart(request: AddToCartRequest): Promise<Cart> {
    const response = await api.post('/api/cart/add', request);
    return response.data;
  }

  // Update item quantity
  async updateCartItemQuantity(productId: number, quantity: number): Promise<Cart> {
    const response = await api.put(`/api/cart/items/${productId}?quantity=${quantity}`);
    return response.data;
  }

  // Remove item from cart
  async removeFromCart(productId: number): Promise<Cart> {
    const response = await api.delete(`/api/cart/items/${productId}`);
    return response.data;
  }

  // Clear entire cart
  async clearCart(): Promise<{ message: string }> {
    const response = await api.delete('/api/cart/clear');
    return response.data;
  }

  // Get cart items count
  async getCartItemsCount(): Promise<{ count: number }> {
    const response = await api.get('/api/cart/count');
    return response.data;
  }

  // Validate cart
  async validateCart(): Promise<{ valid: boolean }> {
    const response = await api.get('/api/cart/validate');
    return response.data;
  }
}

export const cartService = new CartService();