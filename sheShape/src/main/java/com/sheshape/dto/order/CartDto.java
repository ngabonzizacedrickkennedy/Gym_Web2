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
public class CartDto {

    private Long id;
    private Long userId;

    @Builder.Default
    private List<CartItemDto> items = new ArrayList<>();

    private BigDecimal totalAmount;
    private Integer totalItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor from entity
    public CartDto(Cart cart) {
        this.id = cart.getId();
        this.userId = cart.getUser().getId();

        this.items = cart.getItems().stream()
                .map(CartItemDto::new)
                .toList();

        this.totalAmount = cart.getTotalAmount();
        this.totalItems = cart.getTotalItems();
        this.createdAt = cart.getCreatedAt();
        this.updatedAt = cart.getUpdatedAt();
    }
}
