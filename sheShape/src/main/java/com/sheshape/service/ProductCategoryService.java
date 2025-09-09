package com.sheshape.service;

import com.sheshape.dto.ProductDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface ProductCategoryService {
    
    /**
     * Get all unique categories from active products
     * @return List of category names
     */
    List<String> getAllCategories();
    
    /**
     * Get categories with their product counts
     * @return Map of category name to product count
     */
    Map<String, Long> getCategoriesWithProductCounts();
    
    /**
     * Get products by category with pagination
     * @param category Category name
     * @param pageable Pagination information
     * @return Paginated list of products
     */
    Page<ProductDto> getProductsByCategory(String category, Pageable pageable);
    
    /**
     * Get category statistics
     * @return Map containing various statistics about categories
     */
    Map<String, Object> getCategoryStatistics();
    
    /**
     * Search categories by name (case-insensitive)
     * @param query Search query
     * @return List of matching categories
     */
    List<String> searchCategories(String query);
    
    /**
     * Get most popular categories by product count
     * @param limit Maximum number of categories to return
     * @return List of popular categories
     */
    List<String> getPopularCategories(int limit);
    
    /**
     * Get categories that have products in stock
     * @return List of categories with available inventory
     */
    List<String> getCategoriesWithStock();

    List<String> getProductCategories();
}