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
  customerNotes?: string; // ✅ Fixed: Changed from 'notes' to 'customerNotes'
  paymentDetails?: {
    cardNumber?: string;
    cardHolderName?: string;
    expiryMonth?: string; // ✅ Fixed: Changed from number to string
    expiryYear?: string;  // ✅ Fixed: Changed from number to string
    cvv?: string;
    walletId?: string;
    walletProvider?: string; // ✅ Fixed: Changed from 'walletType' to 'walletProvider'
  };
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  price: number;        // ✅ Fixed: Changed from 'unitPrice' to 'price'
  discountPrice?: number; // ✅ Added: To match backend
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userEmail?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED'; // ✅ Fixed: Changed 'COMPLETED' to 'PAID'
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  taxAmount?: number;      // ✅ Fixed: Changed from 'taxes' to 'taxAmount'
  shippingAmount?: number; // ✅ Fixed: Changed from 'shippingCost' to 'shippingAmount'
  discountAmount?: number; // ✅ Fixed: Changed from 'totalDiscount' to 'discountAmount'
  shippingAddress: string; // ✅ Fixed: Backend returns formatted string
  billingAddress: string;  // ✅ Fixed: Backend returns formatted string
  customerNotes?: string;  // ✅ Fixed: Changed from 'notes' to 'customerNotes'
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
      // ✅ Convert number fields to strings for backend compatibility
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
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid checkout request');
      }
      if (error.response?.status === 404) {
        throw new Error('Cart is empty or not found');
      }
      throw new Error('Failed to process checkout');
    }
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
    
    // Process each order in the response
    const processedContent = response.data.content.map((order: any) => 
      this.processOrderResponse(order)
    );
    
    return {
      ...response.data,
      content: processedContent
    };
  }

  // Get current user's recent orders
  async getMyRecentOrders(limit: number = 5): Promise<Order[]> {
    const response = await api.get('/api/orders/my-orders/recent', {
      params: { limit }
    });
    return response.data.map((order: any) => this.processOrderResponse(order));
  }

  // Get order by ID
  async getOrderById(orderId: number): Promise<Order> {
    const response = await api.get(`/api/orders/${orderId}`);
    return this.processOrderResponse(response.data);
  }

  // Get order by order number
  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const response = await api.get(`/api/orders/number/${orderNumber}`);
    return this.processOrderResponse(response.data);
  }

  // Cancel order
  async cancelOrder(orderId: number, reason?: string): Promise<Order> {
    const response = await api.put(`/api/orders/${orderId}/cancel`, null, {
      params: { reason: reason || 'Cancelled by customer' }
    });
    return this.processOrderResponse(response.data);
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

    // Validate payment details for credit card
    if (request.paymentMethod === 'CREDIT_CARD' && request.paymentDetails) {
      const payment = request.paymentDetails;
      if (!payment.cardNumber?.trim()) errors.push('Card number is required');
      if (!payment.expiryMonth?.toString().trim()) errors.push('Expiry month is required');
      if (!payment.expiryYear?.toString().trim()) errors.push('Expiry year is required');
      if (!payment.cvv?.trim()) errors.push('CVV is required');
      if (!payment.cardHolderName?.trim()) errors.push('Card holder name is required');
    }

    return errors;
  }

  // ✅ Helper method to process order response and parse addresses
  private processOrderResponse(order: any): Order {
    return {
      ...order,
      // Parse formatted addresses back to objects if needed for display
      shippingAddressParsed: this.parseFormattedAddress(order.shippingAddress),
      billingAddressParsed: this.parseFormattedAddress(order.billingAddress),
    } as Order & { 
      shippingAddressParsed?: Address; 
      billingAddressParsed?: Address; 
    };
  }

  // ✅ Helper method to parse formatted address string back to Address object
  private parseFormattedAddress(formattedAddress: string): Address | null {
    if (!formattedAddress || !formattedAddress.trim()) return null;

    try {
      const lines = formattedAddress.split('\n').map(line => line.trim());
      
      const address: Partial<Address> = {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      };

      // Parse based on typical format:
      // Line 0: "FirstName LastName"
      // Line 1: "Street Address"  
      // Line 2: "City, State ZipCode"
      // Line 3: "Country"

      if (lines.length > 0 && lines[0]) {
        const nameParts = lines[0].split(' ');
        if (nameParts.length >= 2) {
          address.firstName = nameParts[0];
          address.lastName = nameParts.slice(1).join(' ');
        }
      }

      if (lines.length > 1) {
        address.street = lines[1] || '';
      }

      if (lines.length > 2) {
        const cityStateZip = lines[2];
        // Parse "City, State ZipCode"
        const parts = cityStateZip.split(',');
        if (parts.length >= 2) {
          address.city = parts[0].trim();
          const stateZip = parts[1].trim().split(' ');
          if (stateZip.length >= 2) {
            address.state = stateZip[0];
            address.zipCode = stateZip.slice(1).join(' ');
          } else {
            address.state = stateZip[0] || '';
          }
        } else {
          address.city = cityStateZip;
        }
      }

      if (lines.length > 3) {
        address.country = lines[3] || '';
      }

      return address as Address;
    } catch (error) {
      console.warn('Failed to parse formatted address:', formattedAddress, error);
      return null;
    }
  }
}

export const orderService = new OrderService();