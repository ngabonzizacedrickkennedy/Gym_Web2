package com.sheshape.dto.order;

import com.sheshape.model.order.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDto {

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

    public OrderItemDto(OrderItem orderItem) {
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