package com.sheshape.dto.order;

import com.sheshape.model.order.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDto {

    private Long id;
    private String orderNumber;
    private Long userId;
    private String userEmail;
    private List<OrderItemDto> items = new ArrayList<>();
    private Order.OrderStatus status;
    private Order.PaymentStatus paymentStatus;
    private Order.PaymentMethod paymentMethod;
    private BigDecimal totalAmount;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingAmount;
    private BigDecimal discountAmount;
    private String shippingAddress;
    private String billingAddress;
    private String customerNotes;
    private String trackingNumber;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderDto(Order order) {
        this.id = order.getId();
        this.orderNumber = order.getOrderNumber();
        this.userId = order.getUser().getId();
        this.userEmail = order.getUser().getEmail();
        this.status = order.getStatus();
        this.paymentStatus = order.getPaymentStatus();
        this.paymentMethod = order.getPaymentMethod();
        this.totalAmount = order.getTotalAmount();
        this.subtotal = order.getSubtotal();
        this.taxAmount = order.getTaxAmount();
        this.shippingAmount = order.getShippingAmount();
        this.discountAmount = order.getDiscountAmount();
        this.shippingAddress = order.getShippingAddress();
        this.billingAddress = order.getBillingAddress();
        this.customerNotes = order.getCustomerNotes();
        this.trackingNumber = order.getTrackingNumber();
        this.estimatedDeliveryDate = order.getEstimatedDeliveryDate();
        this.createdAt = order.getCreatedAt();
        this.updatedAt = order.getUpdatedAt();

        if (order.getItems() != null) {
            this.items = order.getItems().stream()
                    .map(OrderItemDto::new)
                    .collect(Collectors.toList());
        }
    }
}