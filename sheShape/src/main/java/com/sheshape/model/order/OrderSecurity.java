package com.sheshape.model.order;

import com.sheshape.model.order.Order;
import com.sheshape.repository.UserRepository;
import com.sheshape.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderSecurity {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    /**
     * Check if the authenticated user owns the order
     */
    public boolean isOrderOwner(Long orderId, String userEmail) {
        return orderRepository.findById(orderId)
                .map(order -> order.getUser().getEmail().equals(userEmail))
                .orElse(false);
    }

    /**
     * Check if the authenticated user owns the order by order number
     */
    public boolean isOrderOwnerByNumber(String orderNumber, String userEmail) {
        return orderRepository.findByOrderNumber(orderNumber)
                .map(order -> order.getUser().getEmail().equals(userEmail))
                .orElse(false);
    }
}