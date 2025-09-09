package com.sheshape.dto.order;

import com.sheshape.model.order.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {

    private Long id;
    private String orderNumber;
    private Long userId;
    private String customerEmail;
    private String customerPhone;

    @Builder.Default
    private List<OrderItemDto> items = new ArrayList<>();

    private String status;
    private String paymentStatus;
    private String paymentMethod;

    private BigDecimal totalAmount;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingAmount;
    private BigDecimal discountAmount;

    // Shipping Address
    private String shippingAddressLine1;
    private String shippingAddressLine2;
    private String shippingCity;
    private String shippingState;
    private String shippingPostalCode;
    private String shippingCountry;

    // Billing Address
    private String billingAddressLine1;
    private String billingAddressLine2;
    private String billingCity;
    private String billingState;
    private String billingPostalCode;
    private String billingCountry;

    private String notes;
    private String trackingNumber;

    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor from entity
    public OrderDto(Order order) {
        this.id = order.getId();
        this.orderNumber = order.getOrderNumber();
        this.userId = order.getUser().getId();
        this.customerEmail = order.getCustomerEmail();
        this.customerPhone = order.getCustomerPhone();

        this.items = order.getItems().stream()
                .map(OrderItemDto::new)
                .toList();

        this.status = order.getStatus().name();
        this.paymentStatus = order.getPaymentStatus().name();
        this.paymentMethod = order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null;

        this.totalAmount = order.getTotalAmount();
        this.subtotal = order.getSubtotal();
        this.taxAmount = order.getTaxAmount();
        this.shippingAmount = order.getShippingAmount();
        this.discountAmount = order.getDiscountAmount();

        // Shipping Address
        this.shippingAddressLine1 = order.getShippingAddressLine1();
        this.shippingAddressLine2 = order.getShippingAddressLine2();
        this.shippingCity = order.getShippingCity();
        this.shippingState = order.getShippingState();
        this.shippingPostalCode = order.getShippingPostalCode();
        this.shippingCountry = order.getShippingCountry();

        // Billing Address
        this.billingAddressLine1 = order.getBillingAddressLine1();
        this.billingAddressLine2 = order.getBillingAddressLine2();
        this.billingCity = order.getBillingCity();
        this.billingState = order.getBillingState();
        this.billingPostalCode = order.getBillingPostalCode();
        this.billingCountry = order.getBillingCountry();

        this.notes = order.getNotes();
        this.trackingNumber = order.getTrackingNumber();

        this.shippedAt = order.getShippedAt();
        this.deliveredAt = order.getDeliveredAt();
        this.createdAt = order.getCreatedAt();
        this.updatedAt = order.getUpdatedAt();
    }
}