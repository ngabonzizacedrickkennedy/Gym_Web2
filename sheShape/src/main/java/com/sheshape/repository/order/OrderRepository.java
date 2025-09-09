package com.sheshape.repository.order;

import com.sheshape.model.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Find order by order number
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Find all orders for a user
     */
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Find orders by status
     */
    Page<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status, Pageable pageable);

    /**
     * Find orders by payment status
     */
    Page<Order> findByPaymentStatusOrderByCreatedAtDesc(Order.PaymentStatus paymentStatus, Pageable pageable);

    /**
     * Find user's orders by status
     */
    List<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Order.OrderStatus status);

    /**
     * Find order with items eagerly loaded
     */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items oi LEFT JOIN FETCH oi.product p WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);

    /**
     * Find recent orders (last 30 days)
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :since ORDER BY o.createdAt DESC")
    List<Order> findRecentOrders(@Param("since") LocalDateTime since);

    /**
     * Count orders by status
     */
    long countByStatus(Order.OrderStatus status);

    /**
     * Count user's orders
     */
    long countByUserId(Long userId);

    /**
     * Find orders within date range
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findOrdersBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}