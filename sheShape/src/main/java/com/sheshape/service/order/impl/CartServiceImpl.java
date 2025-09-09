package com.sheshape.service.order.impl;

import com.sheshape.dto.order.CartDto;
import com.sheshape.dto.order.AddToCartRequestDto;
import com.sheshape.exception.BadRequestException;
import com.sheshape.exception.ResourceNotFoundException;
import com.sheshape.model.Product;
import com.sheshape.model.User;
import com.sheshape.model.order.Cart;
import com.sheshape.model.order.CartItem;
import com.sheshape.repository.ProductRepository;
import com.sheshape.repository.UserRepository;
import com.sheshape.repository.order.CartItemRepository;
import com.sheshape.repository.order.CartRepository;
import com.sheshape.service.order.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartDto getUserCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return new CartDto(cart);
    }

    @Override
    public CartDto addToCart(Long userId, AddToCartRequestDto request) {
        // Validate product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.getIsActive()) {
            throw new BadRequestException("Product is not available for purchase");
        }

        if (product.getInventoryCount() < request.getQuantity()) {
            throw new BadRequestException("Not enough inventory available. Available: " + product.getInventoryCount());
        }

        // Get or create cart
        Cart cart = getOrCreateCart(userId);

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), request.getProductId());

        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();

            if (product.getInventoryCount() < newQuantity) {
                throw new BadRequestException("Not enough inventory available. Available: " + product.getInventoryCount());
            }

            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
            log.info("Updated cart item quantity for user: {} product: {} new quantity: {}", userId, request.getProductId(), newQuantity);
        } else {
            // Create new cart item
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();

            cart.addItem(cartItem);
            cartItemRepository.save(cartItem);
            log.info("Added new item to cart for user: {} product: {} quantity: {}", userId, request.getProductId(), request.getQuantity());
        }

        Cart updatedCart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        return new CartDto(updatedCart);
    }

    @Override
    public CartDto updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        if (quantity < 0) {
            throw new BadRequestException("Quantity cannot be negative");
        }

        if (quantity == 0) {
            return removeFromCart(userId, productId);
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        // Check inventory
        if (cartItem.getProduct().getInventoryCount() < quantity) {
            throw new BadRequestException("Not enough inventory available. Available: " + cartItem.getProduct().getInventoryCount());
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        Cart updatedCart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        log.info("Updated cart item quantity for user: {} product: {} quantity: {}", userId, productId, quantity);
        return new CartDto(updatedCart);
    }

    @Override
    public CartDto removeFromCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);

        Cart updatedCart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        log.info("Removed item from cart for user: {} product: {}", userId, productId);
        return new CartDto(updatedCart);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.clearItems();
        cartItemRepository.deleteByCartId(cart.getId());

        log.info("Cleared cart for user: {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getCartItemsCount(Long userId) {
        Optional<Cart> cart = cartRepository.findByUserId(userId);
        if (cart.isPresent()) {
            return cartItemRepository.countTotalItemsInCart(cart.get().getId());
        }
        return 0;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateCart(Long userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserIdWithItems(userId);
        if (cartOpt.isEmpty()) {
            return true; // Empty cart is valid
        }

        Cart cart = cartOpt.get();
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (!product.getIsActive() || product.getInventoryCount() < item.getQuantity()) {
                return false;
            }
        }
        return true;
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();

                    return cartRepository.save(newCart);
                });
    }
}