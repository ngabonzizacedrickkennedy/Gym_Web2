// src/services/cartService.ts
import { api } from '@/lib/api';

export interface CartItem {
  id: number;
  productId: number;
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
  unitPrice: number;
  totalPrice: number;
  available: boolean;
  addedAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  sessionId?: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;    // Backend uses totalAmount
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
    try {
      const response = await api.get('/api/cart');
      return this.processCartResponse(response.data);
    } catch (error: any) {
      console.error('Get cart error:', error);
      if (error.response?.status === 404) {
        // Return empty cart if not found
        return this.createEmptyCart();
      }
      throw new Error('Failed to fetch cart');
    }
  }

  // Add item to cart
  async addToCart(request: AddToCartRequest): Promise<Cart> {
    try {
      // Validate request
      if (!request.productId || request.quantity <= 0) {
        throw new Error('Invalid product ID or quantity');
      }

      const response = await api.post('/api/cart/add', {
        productId: request.productId,
        quantity: request.quantity
      });
      return this.processCartResponse(response.data);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid request');
      }
      if (error.response?.status === 404) {
        throw new Error('Product not found');
      }
      if (error.response?.status === 409) {
        throw new Error('Insufficient inventory');
      }
      throw new Error('Failed to add item to cart');
    }
  }

  // Update item quantity
  async updateCartItemQuantity(productId: number, quantity: number): Promise<Cart> {
    try {
      if (quantity <= 0) {
        // If quantity is 0 or negative, remove the item
        return this.removeFromCart(productId);
      }

      const response = await api.put(`/api/cart/items/${productId}`, null, {
        params: { quantity }
      });
      return this.processCartResponse(response.data);
    } catch (error: any) {
      console.error('Update cart item error:', error);
      if (error.response?.status === 400) {
        throw new Error('Invalid quantity');
      }
      if (error.response?.status === 404) {
        throw new Error('Item not found in cart');
      }
      throw new Error('Failed to update item quantity');
    }
  }

  // Remove item from cart
  async removeFromCart(productId: number): Promise<Cart> {
    try {
      const response = await api.delete(`/api/cart/items/${productId}`);
      return this.processCartResponse(response.data);
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      if (error.response?.status === 404) {
        throw new Error('Item not found in cart');
      }
      throw new Error('Failed to remove item from cart');
    }
  }

  // Clear entire cart
  async clearCart(): Promise<{ message: string }> {
    try {
      const response = await api.delete('/api/cart/clear');
      return response.data;
    } catch (error: any) {
      console.error('Clear cart error:', error);
      throw new Error('Failed to clear cart');
    }
  }

  // Get cart items count
  async getCartItemsCount(): Promise<{ count: number }> {
    try {
      const response = await api.get('/api/cart/count');
      return response.data;
    } catch (error: any) {
      console.error('Get cart count error:', error);
      // Return 0 if error occurs
      return { count: 0 };
    }
  }

  // Validate cart
  async validateCart(): Promise<{ valid: boolean; issues?: string[] }> {
    try {
      const response = await api.get('/api/cart/validate');
      return response.data;
    } catch (error: any) {
      console.error('Validate cart error:', error);
      return { valid: false, issues: ['Failed to validate cart'] };
    }
  }

  // Helper method to process cart response
  private processCartResponse(cart: any): Cart {
    return {
      ...cart,
      // Ensure arrays exist
      items: cart.items || [],
      // Ensure numbers are properly typed
      totalItems: Number(cart.totalItems) || 0,
      totalAmount: Number(cart.totalAmount) || 0,
      subtotal: Number(cart.subtotal) || 0,
      totalDiscount: Number(cart.totalDiscount) || 0,
      // Ensure dates exist
      createdAt: cart.createdAt || new Date().toISOString(),
      updatedAt: cart.updatedAt || new Date().toISOString(),
    };
  }

  // Helper method to create empty cart
  private createEmptyCart(): Cart {
    return {
      id: 0,
      userId: 0,
      items: [],
      totalItems: 0,
      totalAmount: 0,
      subtotal: 0,
      totalDiscount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Helper method to calculate cart totals
  calculateCartTotals(items: CartItem[]): {
    totalItems: number;
    subtotal: number;
    totalDiscount: number;
    totalAmount: number;
  } {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Calculate total discount
    const totalDiscount = items.reduce((sum, item) => {
      const originalPrice = item.product.price * item.quantity;
      const actualPrice = item.totalPrice;
      return sum + (originalPrice - actualPrice);
    }, 0);

    const totalAmount = subtotal; // Assuming no additional fees for now

    return {
      totalItems,
      subtotal,
      totalDiscount,
      totalAmount,
    };
  }
}

export const cartService = new CartService();