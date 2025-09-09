package com.sheshape.controller.order;

import com.sheshape.dto.order.AddToCartRequestDto;
import com.sheshape.dto.order.CartDto;
import com.sheshape.service.UserService;
import com.sheshape.service.order.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    /**
     * Get current user's cart
     */
    @GetMapping
    public ResponseEntity<CartDto> getUserCart() {
        Long userId = userService.getCurrentUser().getId();
        CartDto cart = cartService.getUserCart(userId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Add item to cart (requires authentication)
     */
    @PostMapping("/add")
    public ResponseEntity<CartDto> addToCart(@Valid @RequestBody AddToCartRequestDto request) {
        Long userId = userService.getCurrentUser().getId();
        CartDto cart = cartService.addToCart(userId, request);
        return ResponseEntity.ok(cart);
    }

    /**
     * Update item quantity in cart
     */
    @PutMapping("/items/{productId}")
    public ResponseEntity<CartDto> updateCartItemQuantity(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        Long userId = userService.getCurrentUser().getId();
        CartDto cart = cartService.updateCartItemQuantity(userId, productId, quantity);
        return ResponseEntity.ok(cart);
    }

    /**
     * Remove item from cart
     */
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartDto> removeFromCart(@PathVariable Long productId) {
        Long userId = userService.getCurrentUser().getId();
        CartDto cart = cartService.removeFromCart(userId, productId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Clear entire cart
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearCart() {
        Long userId = userService.getCurrentUser().getId();
        cartService.clearCart(userId);
        return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
    }

    /**
     * Get cart items count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getCartItemsCount() {
        Long userId = userService.getCurrentUser().getId();
        Integer count = cartService.getCartItemsCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Validate cart
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Boolean>> validateCart() {
        Long userId = userService.getCurrentUser().getId();
        boolean isValid = cartService.validateCart(userId);
        return ResponseEntity.ok(Map.of("valid", isValid));
    }

    // Admin endpoints

    /**
     * Get user's cart by user ID (admin only)
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CartDto> getUserCartById(@PathVariable Long userId) {
        CartDto cart = cartService.getUserCart(userId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Clear user's cart by user ID (admin only)
     */
    @DeleteMapping("/user/{userId}/clear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> clearUserCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(Map.of("message", "User cart cleared successfully"));
    }
}