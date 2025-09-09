package com.sheshape.dto.order;

import com.sheshape.dto.ProductDto;
import com.sheshape.model.order.CartItem;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDto {

    private Long id;

    @NotNull(message = "Product ID is required")
    private Long productId;

    private ProductDto product;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private boolean available;
    private LocalDateTime addedAt;
    private LocalDateTime updatedAt;

    public CartItemDto(CartItem cartItem) {
        this.id = cartItem.getId();
        this.productId = cartItem.getProduct().getId();
        this.product = new ProductDto(cartItem.getProduct());
        this.quantity = cartItem.getQuantity();
        this.unitPrice = cartItem.getUnitPrice();
        this.totalPrice = cartItem.getTotalPrice();
        this.available = cartItem.isAvailable();
        this.addedAt = cartItem.getAddedAt();
        this.updatedAt = cartItem.getUpdatedAt();
    }
}