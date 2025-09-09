package com.sheshape.repository.order;

import com.sheshape.model.order.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /**
     * Find cart item by cart and product
     */
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    /**
     * Find all items in a cart
     */
    List<CartItem> findByCartId(Long cartId);

    /**
     * Find items with product details
     */
    @Query("SELECT ci FROM CartItem ci LEFT JOIN FETCH ci.product p WHERE ci.cart.id = :cartId")
    List<CartItem> findByCartIdWithProduct(@Param("cartId") Long cartId);

    /**
     * Count total items in a cart
     */
    @Query("SELECT COALESCE(SUM(ci.quantity), 0) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Integer countTotalItemsInCart(@Param("cartId") Long cartId);

    /**
     * Delete all items from a cart
     */
    void deleteByCartId(Long cartId);

    /**
     * Delete item by cart and product
     */
    void deleteByCartIdAndProductId(Long cartId, Long productId);
}