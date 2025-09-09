package com.sheshape.model.order;



import com.sheshape.model.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @ToString.Exclude
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "discount_price", precision = 10, scale = 2)
    private BigDecimal discountPrice;

    // Store product details at time of purchase (for historical accuracy)
    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "product_description", length = 2000)
    private String productDescription;

    @Column(name = "product_category")
    private String productCategory;

    @Column(name = "product_image_url")
    private String productImageUrl;

    // Helper method to calculate total price for this item
    public BigDecimal getTotalPrice() {
        BigDecimal effectivePrice = discountPrice != null ? discountPrice : price;
        return effectivePrice.multiply(BigDecimal.valueOf(quantity));
    }
}