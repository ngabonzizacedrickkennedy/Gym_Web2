package com.sheshape.controller.order;

import com.sheshape.dto.order.CheckoutRequestDto;
import com.sheshape.dto.order.OrderDto;
import com.sheshape.model.order.Order;
import com.sheshape.service.UserService;
import com.sheshape.service.order.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    /**
     * Checkout - Create order from cart
     */
    @PostMapping("/checkout")
    public ResponseEntity<OrderDto> checkout(@Valid @RequestBody CheckoutRequestDto checkoutRequest) {
        Long userId = userService.getCurrentUser().getId();
        OrderDto order = orderService.checkout(userId, checkoutRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * Get current user's orders
     */
    @GetMapping("/my-orders")
    public ResponseEntity<Page<OrderDto>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Long userId = userService.getCurrentUser().getId();
        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<OrderDto> orders = orderService.getUserOrders(userId, pageable);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get current user's recent orders
     */
    @GetMapping("/my-orders/recent")
    public ResponseEntity<List<OrderDto>> getMyRecentOrders(
            @RequestParam(defaultValue = "5") int limit) {
        Long userId = userService.getCurrentUser().getId();
        List<OrderDto> orders = orderService.getUserRecentOrders(userId, limit);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get order by ID (user can only access their own orders)
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or @orderSecurity.isOrderOwner(#orderId, authentication.name)")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long orderId) {
        OrderDto order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    /**
     * Get order by order number
     */
    @GetMapping("/number/{orderNumber}")
    @PreAuthorize("hasRole('ADMIN') or @orderSecurity.isOrderOwnerByNumber(#orderNumber, authentication.name)")
    public ResponseEntity<OrderDto> getOrderByNumber(@PathVariable String orderNumber) {
        OrderDto order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    /**
     * Cancel order (user can only cancel their own orders)
     */
    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('ADMIN') or @orderSecurity.isOrderOwner(#orderId, authentication.name)")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false, defaultValue = "Cancelled by customer") String reason) {
        OrderDto order = orderService.cancelOrder(orderId, reason);
        return ResponseEntity.ok(order);
    }

    // Admin-only endpoints

    /**
     * Get all orders (admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDto>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<OrderDto> orders = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get orders by status (admin only)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDto>> getOrdersByStatus(
            @PathVariable Order.OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderDto> orders = orderService.getOrdersByStatus(status, pageable);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get user's orders by user ID (admin only)
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDto>> getUserOrders(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderDto> orders = orderService.getUserOrders(userId, pageable);
        return ResponseEntity.ok(orders);
    }

    /**
     * Update order status (admin only)
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Order.OrderStatus status) {
        OrderDto order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }

    /**
     * Update payment status (admin only)
     */
    @PutMapping("/{orderId}/payment-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestParam Order.PaymentStatus paymentStatus) {
        OrderDto order = orderService.updatePaymentStatus(orderId, paymentStatus);
        return ResponseEntity.ok(order);
    }

    /**
     * Cancel order (admin can cancel any order)
     */
    @PutMapping("/{orderId}/admin-cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> adminCancelOrder(
            @PathVariable Long orderId,
            @RequestParam String reason) {
        OrderDto order = orderService.cancelOrder(orderId, reason);
        return ResponseEntity.ok(order);
    }


    @PostMapping("/{orderId}/resend-confirmation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> resendOrderConfirmation(@PathVariable Long orderId) {
        orderService.sendOrderConfirmationEmail(orderId);
        return ResponseEntity.ok(Map.of("message", "Confirmation email sent successfully"));
    }
}