// src/services/orderService.ts
import { api } from '@/lib/api';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CheckoutRequest {
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'DIGITAL_WALLET' | 'CASH_ON_DELIVERY';
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  paymentDetails?: {
    cardNumber?: string;
    cardHolderName?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cvv?: string;
    paypalEmail?: string;
    walletType?: string;
  };
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  totalDiscount: number;
  shippingCost: number;
  taxes: number;
  totalAmount: number;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
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
    const response = await api.post('/api/orders/checkout', checkoutRequest);
    return response.data;
  }

  // Get current user's orders
  async getMyOrders(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    direction: 'asc' | 'desc' = 'desc'
  ): Promise<OrderPage> {
    const response = await api.get('/api/orders/my-orders', {
      params: { page, size, sortBy, direction }
    });
    return response.data;
  }

  // Get order by ID
  async getOrderById(orderId: number): Promise<Order> {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  }

  // Cancel order
  async cancelOrder(orderId: number, reason?: string): Promise<{ message: string }> {
    const response = await api.put(`/api/orders/${orderId}/cancel`, { reason });
    return response.data;
  }

  // Track order
  async trackOrder(orderNumber: string): Promise<Order> {
    const response = await api.get(`/api/orders/track/${orderNumber}`);
    return response.data;
  }
}

export const orderService = new OrderService();