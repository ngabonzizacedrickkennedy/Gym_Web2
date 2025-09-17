package com.sheshape.service.order.impl;

import com.sheshape.dto.order.AddressDto;
import com.sheshape.dto.order.CheckoutRequestDto;
import com.sheshape.dto.order.OrderDto;
import com.sheshape.dto.order.PaymentDetailsDto;
import com.sheshape.exception.BadRequestException;
import com.sheshape.exception.ResourceNotFoundException;
import com.sheshape.model.Product;
import com.sheshape.model.User;
import com.sheshape.model.order.Cart;
import com.sheshape.model.order.CartItem;
import com.sheshape.model.order.Order;
import com.sheshape.model.order.OrderItem;
import com.sheshape.repository.UserRepository;
import com.sheshape.repository.order.CartRepository;
import com.sheshape.repository.order.OrderRepository;
import com.sheshape.service.ProductService;
import com.sheshape.service.order.CartService;
import com.sheshape.service.order.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final ProductService productService;
    private final UserRepository userRepository;

    @Override
    public OrderDto checkout(Long userId, CheckoutRequestDto checkoutRequest) {
        // Validate user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Get user's cart
        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found or empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot checkout with empty cart");
        }

        // Validate cart items
        if (!cartService.validateCart(userId)) {
            throw new BadRequestException("Cart contains invalid items. Please review your cart.");
        }

        // Calculate totals
        BigDecimal subtotal = calculateSubtotal(cart);
        BigDecimal shippingAmount = calculateShippingAmount(cart, checkoutRequest.getShippingAddress());
        BigDecimal taxAmount = calculateTaxAmount(subtotal);
        BigDecimal totalAmount = subtotal.add(shippingAmount).add(taxAmount);

        // Create order with generated order number
        Order order = Order.builder()
                .user(user)
                .orderNumber(generateOrderNumber())
                .status(Order.OrderStatus.PENDING)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .paymentMethod(checkoutRequest.getPaymentMethod())
                .shippingAddress(checkoutRequest.getShippingAddress().toFormattedString())
                .billingAddress(checkoutRequest.getBillingAddress() != null ?
                        checkoutRequest.getBillingAddress().toFormattedString() :
                        checkoutRequest.getShippingAddress().toFormattedString())
                .customerNotes(checkoutRequest.getCustomerNotes())
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .shippingAmount(shippingAmount)
                .totalAmount(totalAmount)
                .discountAmount(BigDecimal.ZERO)
                .estimatedDeliveryDate(calculateEstimatedDeliveryDate())
                .items(new ArrayList<>())
                .build();

        // Convert cart items to order items
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Double-check inventory before creating order
            if (product.getInventoryCount() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient inventory for product: " + product.getName());
            }

            // Use the existing OrderItem structure from your original code
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice()) // Use the existing 'price' field
                    .discountPrice(product.getDiscountPrice()) // Use the existing 'discountPrice' field
                    .productName(product.getName())
                    .productDescription(product.getDescription())
                    .productCategory(product.getCategories().isEmpty() ? null :
                            String.join(", ", product.getCategories()))
                    .productImageUrl(getProductMainImageUrl(product))
                    .build();

            order.getItems().add(orderItem);

            // Update inventory
            if (!productService.updateInventory(product.getId(), cartItem.getQuantity())) {
                throw new BadRequestException("Failed to update inventory for product: " + product.getName());
            }
        }

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Process payment if payment details provided
        if (checkoutRequest.getPaymentDetails() != null) {
            boolean paymentSuccess = processPayment(savedOrder.getId(), checkoutRequest.getPaymentDetails());
            if (paymentSuccess) {
                savedOrder.setPaymentStatus(Order.PaymentStatus.PAID);
                savedOrder.setStatus(Order.OrderStatus.CONFIRMED);
                savedOrder = orderRepository.save(savedOrder);
            } else {
                savedOrder.setPaymentStatus(Order.PaymentStatus.FAILED);
                savedOrder.setStatus(Order.OrderStatus.CANCELLED);
                savedOrder = orderRepository.save(savedOrder);
                throw new BadRequestException("Payment processing failed");
            }
        }

        // Clear cart after successful order
        cartService.clearCart(userId);

        // Send confirmation email (async)
        try {
            sendOrderConfirmationEmail(savedOrder.getId());
        } catch (Exception e) {
            log.warn("Failed to send order confirmation email for order: {}", savedOrder.getOrderNumber(), e);
        }

        log.info("Order created successfully: {} for user: {}", savedOrder.getOrderNumber(), userId);
        return new OrderDto(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return new OrderDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        return new OrderDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> getUserOrders(Long userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return orders.map(OrderDto::new);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(OrderDto::new);
    }

    @Override
    public OrderDto updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);

        log.info("Updated order status: {} to {}", order.getOrderNumber(), status);
        return new OrderDto(updatedOrder);
    }

    @Override
    public OrderDto updatePaymentStatus(Long orderId, Order.PaymentStatus paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setPaymentStatus(paymentStatus);

        // Auto-update order status based on payment status
        if (paymentStatus == Order.PaymentStatus.PAID && order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
        } else if (paymentStatus == Order.PaymentStatus.FAILED) {
            order.setStatus(Order.OrderStatus.CANCELLED);
        }

        Order updatedOrder = orderRepository.save(order);

        log.info("Updated payment status: {} to {}", order.getOrderNumber(), paymentStatus);
        return new OrderDto(updatedOrder);
    }

    @Override
    public OrderDto cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot cancel delivered order");
        }

        if (order.getStatus() == Order.OrderStatus.SHIPPED) {
            throw new BadRequestException("Cannot cancel shipped order. Please contact support.");
        }

        // Restore inventory
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setInventoryCount(product.getInventoryCount() + item.getQuantity());
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCustomerNotes(order.getCustomerNotes() + "\n\nCancellation reason: " + reason);

        Order updatedOrder = orderRepository.save(order);

        log.info("Cancelled order: {} Reason: {}", order.getOrderNumber(), reason);
        return new OrderDto(updatedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        Page<Order> orders = orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return orders.map(OrderDto::new);
    }

    @Override
    public boolean processPayment(Long orderId, PaymentDetailsDto paymentDetails) {
        // This is a mock implementation - in real application, you would integrate with payment providers
        // like Stripe, PayPal, etc.

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        try {
            // Simulate payment processing
            log.info("Processing payment for order: {} Amount: {}", order.getOrderNumber(), order.getTotalAmount());

            // Mock validation
            if (order.getPaymentMethod() == Order.PaymentMethod.CREDIT_CARD ||
                    order.getPaymentMethod() == Order.PaymentMethod.DEBIT_CARD) {

                if (paymentDetails.getCardNumber() == null || paymentDetails.getCvv() == null) {
                    log.error("Invalid card details for order: {}", order.getOrderNumber());
                    return false;
                }

                // Mock card validation - in real app, use payment gateway
                String cleanCardNumber = paymentDetails.getCardNumber().replaceAll("\\s", "");
                if (cleanCardNumber.length() < 13) {
                    log.error("Invalid card number for order: {}", order.getOrderNumber());
                    return false;
                }
            }

            // Simulate successful payment
            Thread.sleep(1000); // Simulate processing time
            log.info("Payment processed successfully for order: {}", order.getOrderNumber());
            return true;

        } catch (Exception e) {
            log.error("Payment processing failed for order: {}", order.getOrderNumber(), e);
            return false;
        }
    }

    @Override
    public void sendOrderConfirmationEmail(Long orderId) {
        // Mock email sending - in real application, use email service
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        log.info("Sending order confirmation email for order: {} to: {}",
                order.getOrderNumber(), order.getUser().getEmail());

        // In real implementation, you would:
        // 1. Create email template with order details
        // 2. Send via email service (like AWS SES, SendGrid, etc.)
        // 3. Log email status
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDto> getUserRecentOrders(Long userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return orders.getContent().stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
    }

    // Helper methods

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis();
    }

    private BigDecimal calculateSubtotal(Cart cart) {
        return cart.getItems().stream()
                .map(item -> {
                    Product product = item.getProduct();
                    // Use discount price if available, otherwise use regular price
                    BigDecimal unitPrice = product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                            ? product.getDiscountPrice()
                            : product.getPrice();
                    return unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateShippingAmount(Cart cart, AddressDto shippingAddress) {
        BigDecimal cartTotal = calculateSubtotal(cart);

        // Free shipping over $100
        if (cartTotal.compareTo(new BigDecimal("100")) >= 0) {
            return BigDecimal.ZERO;
        }

        // Calculate shipping based on country
        String country = shippingAddress != null ? shippingAddress.getCountry() : "RW";
        return switch (country.toUpperCase()) {
            case "RW", "RWANDA" -> new BigDecimal("5.00");
            case "US", "CA", "GB" -> new BigDecimal("15.00");
            case "AU", "DE", "FR", "IT", "ES" -> new BigDecimal("20.00");
            default -> new BigDecimal("25.00");
        };
    }

    private BigDecimal calculateTaxAmount(BigDecimal subtotal) {
        // Simple tax calculation - 10%
        return subtotal.multiply(new BigDecimal("0.10"));
    }

    private LocalDateTime calculateEstimatedDeliveryDate() {
        // Simple calculation - 5-7 business days
        return LocalDateTime.now().plusDays(7);
    }

    private String getProductMainImageUrl(Product product) {
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            return product.getImages().stream()
                    .filter(img -> img.isMain())
                    .findFirst()
                    .map(img -> img.getImageUrl())
                    .orElse(product.getImages().get(0).getImageUrl());
        }
        return null;
    }
}