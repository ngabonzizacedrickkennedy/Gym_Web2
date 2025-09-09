package com.sheshape.dto.order;

import com.sheshape.model.order.Cart;
import com.sheshape.model.order.CartItem;
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
public class CartDto {

    private Long id;
    private Long userId;
    private String sessionId;
    private List<CartItemDto> items = new ArrayList<>();
    private BigDecimal totalAmount;
    private Integer totalItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CartDto(Cart cart) {
        this.id = cart.getId();
        this.userId = cart.getUser() != null ? cart.getUser().getId() : null;
        this.sessionId = cart.getSessionId();
        this.totalAmount = cart.getTotalAmount();
        this.totalItems = cart.getTotalItems();
        this.createdAt = cart.getCreatedAt();
        this.updatedAt = cart.getUpdatedAt();

        if (cart.getItems() != null) {
            this.items = cart.getItems().stream()
                    .map(CartItemDto::new)
                    .collect(Collectors.toList());
        }
    }
}