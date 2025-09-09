package com.sheshape.service.order;

import com.sheshape.dto.order.CartDto;
import com.sheshape.dto.order.AddToCartRequestDto;

public interface CartService {

    /**
     * Get or create user's cart
     */
    CartDto getUserCart(Long userId);

    /**
     * Add item to cart
     */
    CartDto addToCart(Long userId, AddToCartRequestDto request);

    /**
     * Update item quantity in cart
     */
    CartDto updateCartItemQuantity(Long userId, Long productId, Integer quantity);

    /**
     * Remove item from cart
     */
    CartDto removeFromCart(Long userId, Long productId);

    /**
     * Clear all items from cart
     */
    void clearCart(Long userId);

    /**
     * Get cart total items count
     */
    Integer getCartItemsCount(Long userId);

    /**
     * Validate cart items (check availability, pricing, etc.)
     */
    boolean validateCart(Long userId);
}