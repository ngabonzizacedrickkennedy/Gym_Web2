package com.sheshape.model.order;

import com.sheshape.model.Product;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @ToString.Exclude
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @CreatedDate
    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public BigDecimal getUnitPrice() {
        return product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
    }

    public BigDecimal getTotalPrice() {
        return getUnitPrice().multiply(BigDecimal.valueOf(quantity));
    }

    public boolean isAvailable() {
        return product.getIsActive() && product.getInventoryCount() >= quantity;
    }
}