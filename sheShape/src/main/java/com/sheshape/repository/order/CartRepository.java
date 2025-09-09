package com.sheshape.repository.order;

import com.sheshape.model.order.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    /**
     * Find cart by user ID
     */
    Optional<Cart> findByUserId(Long userId);

    /**
     * Find cart by session ID (for guest users)
     */
    Optional<Cart> findBySessionId(String sessionId);

    /**
     * Find cart with items eagerly loaded
     */
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items ci LEFT JOIN FETCH ci.product p WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);

    /**
     * Check if user has an active cart
     */
    boolean existsByUserId(Long userId);

    /**
     * Delete empty carts (optimization for cleanup job)
     */
    @Query("DELETE FROM Cart c WHERE c.items IS EMPTY")
    void deleteEmptyCarts();
}