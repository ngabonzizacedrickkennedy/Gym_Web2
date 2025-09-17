// src/services/orderService.ts
import { api } from '@/lib/api';

export interface Address {
  firstName?: string;
  lastName?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CheckoutRequest {
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'DIGITAL_WALLET' | 'CASH_ON_DELIVERY';
  shippingAddress: Address;
  billingAddress?: Address;
  customerNotes?: string;
  paymentDetails?: {
    cardNumber?: string;
    cardHolderName?: string;
    expiryMonth?: string;    // Backend expects string
    expiryYear?: string;     // Backend expects string
    cvv?: string;
    walletId?: string;
    walletProvider?: string; // Changed from walletType
  };
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  price: number;           // Changed from unitPrice
  discountPrice?: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userEmail?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED'; // Changed COMPLETED to PAID
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  taxAmount?: number;      // Changed from taxes
  shippingAmount?: number; // Changed from shippingCost
  discountAmount?: number; // Changed from totalDiscount
  shippingAddress: string; // Backend returns formatted string
  billingAddress: string;  // Backend returns formatted string
  customerNotes?: string;  // Changed from notes
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPage {
  content: Order[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

class OrderService {
  // Checkout - Create order from cart
  async checkout(checkoutRequest: CheckoutRequest): Promise<Order> {
    try {
      // Ensure all data types match backend expectations
      const backendRequest = {
        ...checkoutRequest,
        paymentDetails: checkoutRequest.paymentDetails ? {
          ...checkoutRequest.paymentDetails,
          expiryMonth: checkoutRequest.paymentDetails.expiryMonth?.toString(),
          expiryYear: checkoutRequest.paymentDetails.expiryYear?.toString(),
        } : undefined
      };

      const response = await api.post('/api/orders/checkout', backendRequest);
      return this.processOrderResponse(response.data);
    } catch (error: any) {
      console.error('Checkout error:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid checkout request');
      }
      if (error.response?.status === 404) {
        throw new Error('Cart is empty or not found');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      throw new Error('Failed to process checkout. Please try again.');
    }
  }

  // Get current user's orders
  async getMyOrders(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    direction: 'asc' | 'desc' = 'desc'
  ): Promise<OrderPage> {
    try {
      const response = await api.get('/api/orders/my-orders', {
        params: { page, size, sortBy, direction }
      });
      
      const processedContent = response.data.content.map((order: any) => 
        this.processOrderResponse(order)
      );
      
      return {
        ...response.data,
        content: processedContent
      };
    } catch (error: any) {
      console.error('Get orders error:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Get current user's recent orders
  async getMyRecentOrders(limit: number = 5): Promise<Order[]> {
    try {
      const response = await api.get('/api/orders/my-orders/recent', {
        params: { limit }
      });
      return response.data.map((order: any) => this.processOrderResponse(order));
    } catch (error: any) {
      console.error('Get recent orders error:', error);
      throw new Error('Failed to fetch recent orders');
    }
  }

  // Get order by ID
  async getOrderById(orderId: number): Promise<Order> {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return this.processOrderResponse(response.data);
    } catch (error: any) {
      console.error('Get order by ID error:', error);
      if (error.response?.status === 404) {
        throw new Error('Order not found');
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to view this order');
      }
      throw new Error('Failed to fetch order');
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber: string): Promise<Order> {
    try {
      const response = await api.get(`/api/orders/number/${orderNumber}`);
      return this.processOrderResponse(response.data);
    } catch (error: any) {
      console.error('Get order by number error:', error);
      if (error.response?.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error('Failed to fetch order');
    }
  }

  // Cancel order
  async cancelOrder(orderId: number, reason?: string): Promise<Order> {
    try {
      const response = await api.put(`/api/orders/${orderId}/cancel`, null, {
        params: { reason: reason || 'Cancelled by customer' }
      });
      return this.processOrderResponse(response.data);
    } catch (error: any) {
      console.error('Cancel order error:', error);
      if (error.response?.status === 400) {
        throw new Error('Cannot cancel this order');
      }
      throw new Error('Failed to cancel order');
    }
  }

  // Track order
  async trackOrder(orderNumber: string): Promise<Order> {
    return this.getOrderByNumber(orderNumber);
  }

  // Validate checkout request before submission
  validateCheckoutRequest(request: CheckoutRequest): string[] {
    const errors: string[] = [];

    if (!request.paymentMethod) {
      errors.push('Payment method is required');
    }

    if (!request.shippingAddress) {
      errors.push('Shipping address is required');
    } else {
      const addr = request.shippingAddress;
      if (!addr.street?.trim()) errors.push('Street address is required');
      if (!addr.city?.trim()) errors.push('City is required');
      if (!addr.state?.trim()) errors.push('State is required');
      if (!addr.zipCode?.trim()) errors.push('ZIP code is required');
      if (!addr.country?.trim()) errors.push('Country is required');
    }

    // Validate payment details for credit/debit cards
    if ((request.paymentMethod === 'CREDIT_CARD' || request.paymentMethod === 'DEBIT_CARD') && request.paymentDetails) {
      const payment = request.paymentDetails;
      if (!payment.cardNumber?.trim()) errors.push('Card number is required');
      if (!payment.expiryMonth?.toString().trim()) errors.push('Expiry month is required');
      if (!payment.expiryYear?.toString().trim()) errors.push('Expiry year is required');
      if (!payment.cvv?.trim()) errors.push('CVV is required');
      if (!payment.cardHolderName?.trim()) errors.push('Card holder name is required');
    }

    return errors;
  }

  // Helper method to process order response
  private processOrderResponse(order: any): Order {
    return {
      ...order,
      // Ensure dates are properly formatted
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: order.updatedAt || new Date().toISOString(),
      // Ensure arrays exist
      items: order.items || [],
      // Ensure numbers are properly typed
      subtotal: Number(order.subtotal) || 0,
      totalAmount: Number(order.totalAmount) || 0,
      taxAmount: order.taxAmount ? Number(order.taxAmount) : undefined,
      shippingAmount: order.shippingAmount ? Number(order.shippingAmount) : undefined,
      discountAmount: order.discountAmount ? Number(order.discountAmount) : undefined,
    };
  }

  // Helper method to parse formatted address (if needed for display)
  private parseFormattedAddress(formattedAddress: string): Address | null {
    if (!formattedAddress) return null;
    
    // This is a simple parser - you might need to adjust based on your backend formatting
    try {
      const parts = formattedAddress.split(', ');
      if (parts.length >= 4) {
        return {
          street: parts[0],
          city: parts[1],
          state: parts[2],
          zipCode: parts[3].split(' ')[0],
          country: parts[parts.length - 1]
        };
      }
    } catch (error) {
      console.warn('Failed to parse address:', error);
    }
    
    return null;
  }
}

export const orderService = new OrderService();