package com.sheshape.dto.order;


import com.sheshape.model.order.Cart;
import com.sheshape.model.order.CartItem;
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
class CartItemDto {

    private Long id;
    private Long productId;
    private String productName;
    private String productDescription;
    private String productCategory;
    private String productImageUrl;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice;
    private Integer availableStock;
    private boolean isAvailable;
    private LocalDateTime addedAt;
    private LocalDateTime updatedAt;

    // Constructor from entity
    public CartItemDto(CartItem cartItem) {
        this.id = cartItem.getId();
        this.productId = cartItem.getProduct().getId();
        this.productName = cartItem.getProduct().getName();
        this.productDescription = cartItem.getProduct().getDescription();

        // Product categories is a Set<String>, so join them or get the first one
        this.productCategory = cartItem.getProduct().getCategories().stream()
                .findFirst()
                .orElse(null);

        // Get the main product image URL
        this.productImageUrl = cartItem.getProduct().getImages().stream()
                .filter(img -> img.isMain()) // Use isMain() method, not getIsMain()
                .findFirst()
                .map(img -> img.getImageUrl())
                .orElse(null);

        this.price = cartItem.getProduct().getPrice();
        this.discountPrice = cartItem.getProduct().getDiscountPrice();
        this.unitPrice = cartItem.getUnitPrice();
        this.quantity = cartItem.getQuantity();
        this.totalPrice = cartItem.getTotalPrice();
        this.availableStock = cartItem.getProduct().getInventoryCount();
        this.isAvailable = cartItem.isAvailable();
        this.addedAt = cartItem.getAddedAt();
        this.updatedAt = cartItem.getUpdatedAt();
    }
}
