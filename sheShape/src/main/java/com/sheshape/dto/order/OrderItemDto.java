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
class OrderItemDto {

    private Long id;
    private Long productId;
    private String productName;
    private String productDescription;
    private String productCategory;
    private String productImageUrl;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private BigDecimal totalPrice;

    // Constructor from entity
    public OrderItemDto(com.sheshape.model.order.OrderItem orderItem) {
        this.id = orderItem.getId();
        this.productId = orderItem.getProduct().getId();
        this.productName = orderItem.getProductName();
        this.productDescription = orderItem.getProductDescription();
        this.productCategory = orderItem.getProductCategory();
        this.productImageUrl = orderItem.getProductImageUrl();
        this.quantity = orderItem.getQuantity();
        this.price = orderItem.getPrice();
        this.discountPrice = orderItem.getDiscountPrice();
        this.totalPrice = orderItem.getTotalPrice();
    }
}