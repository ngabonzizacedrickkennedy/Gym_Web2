package com.sheshape.service.order;

import com.sheshape.dto.order.CheckoutRequestDto;
import com.sheshape.dto.order.OrderDto;
import com.sheshape.dto.order.PaymentDetailsDto;
import com.sheshape.model.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {

    /**
     * Create order from user's cart
     */
    OrderDto checkout(Long userId, CheckoutRequestDto checkoutRequest);

    /**
     * Get order by ID
     */
    OrderDto getOrderById(Long orderId);

    /**
     * Get order by order number
     */
    OrderDto getOrderByOrderNumber(String orderNumber);

    /**
     * Get user's orders
     */
    Page<OrderDto> getUserOrders(Long userId, Pageable pageable);

    /**
     * Get all orders (admin only)
     */
    Page<OrderDto> getAllOrders(Pageable pageable);

    /**
     * Update order status
     */
    OrderDto updateOrderStatus(Long orderId, Order.OrderStatus status);

    /**
     * Update payment status
     */
    OrderDto updatePaymentStatus(Long orderId, Order.PaymentStatus paymentStatus);

    /**
     * Cancel order
     */
    OrderDto cancelOrder(Long orderId, String reason);

    /**
     * Get orders by status
     */
    Page<OrderDto> getOrdersByStatus(Order.OrderStatus status, Pageable pageable);

    /**
     * Process payment for order
     */
    boolean processPayment(Long orderId, PaymentDetailsDto paymentDetails);

    /**
     * Send order confirmation email
     */
    void sendOrderConfirmationEmail(Long orderId);

    /**
     * Get user's recent orders
     */
    List<OrderDto> getUserRecentOrders(Long userId, int limit);
}