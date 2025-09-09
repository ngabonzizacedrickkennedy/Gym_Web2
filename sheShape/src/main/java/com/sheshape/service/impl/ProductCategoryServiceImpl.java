package com.sheshape.service.impl;

import com.sheshape.dto.ProductDto;
import com.sheshape.model.Product;
import com.sheshape.repository.ProductRepository;
import com.sheshape.service.ProductCategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductCategoryServiceImpl implements ProductCategoryService {

    private final ProductRepository productRepository;

    public ProductCategoryServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public List<String> getAllCategories() {
        List<Product> activeProducts = productRepository.findByIsActiveTrue(Pageable.unpaged()).getContent();
        
        return activeProducts.stream()
                .flatMap(product -> product.getCategories().stream())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Long> getCategoriesWithProductCounts() {
        List<Product> activeProducts = productRepository.findByIsActiveTrue(Pageable.unpaged()).getContent();
        
        Map<String, Long> categoryCount = new HashMap<>();
        
        for (Product product : activeProducts) {
            for (String category : product.getCategories()) {
                categoryCount.merge(category, 1L, Long::sum);
            }
        }
        
        // Sort by count descending, then by name ascending
        return categoryCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder())
                        .thenComparing(Map.Entry.comparingByKey()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }

    @Override
    public Page<ProductDto> getProductsByCategory(String category, Pageable pageable) {
        return productRepository.findByCategoryAndIsActiveTrue(category, pageable)
                .map(ProductDto::new);
    }

    @Override
    public Map<String, Object> getCategoryStatistics() {
        List<Product> activeProducts = productRepository.findByIsActiveTrue(Pageable.unpaged()).getContent();
        
        Map<String, Long> categoryCount = new HashMap<>();
        Map<String, Long> categoryStockCount = new HashMap<>();
        Map<String, Double> categoryAvgPrice = new HashMap<>();
        
        for (Product product : activeProducts) {
            for (String category : product.getCategories()) {
                // Count products in category
                categoryCount.merge(category, 1L, Long::sum);
                
                // Count stock in category
                categoryStockCount.merge(category, (long) product.getInventoryCount(), Long::sum);
                
                // Calculate average price (we'll compute this after collecting all data)
                categoryAvgPrice.merge(category, product.getPrice().doubleValue(), Double::sum);
            }
        }
        
        // Calculate actual average prices
        Map<String, Double> actualAvgPrices = new HashMap<>();
        for (String category : categoryCount.keySet()) {
            actualAvgPrices.put(category, categoryAvgPrice.get(category) / categoryCount.get(category));
        }
        
        // Find most popular category
        String mostPopularCategory = categoryCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
        
        // Find category with highest total stock
        String highestStockCategory = categoryStockCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalCategories", categoryCount.size());
        statistics.put("categoriesWithCounts", categoryCount);
        statistics.put("categoryStockCounts", categoryStockCount);
        statistics.put("categoryAveragePrices", actualAvgPrices);
        statistics.put("mostPopularCategory", mostPopularCategory);
        statistics.put("highestStockCategory", highestStockCategory);
        statistics.put("totalActiveProducts", activeProducts.size());
        
        return statistics;
    }

    @Override
    public List<String> searchCategories(String query) {
        List<String> allCategories = getAllCategories();
        
        return allCategories.stream()
                .filter(category -> category.toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getPopularCategories(int limit) {
        Map<String, Long> categoriesWithCounts = getCategoriesWithProductCounts();
        
        return categoriesWithCounts.entrySet().stream()
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getCategoriesWithStock() {
        List<Product> productsInStock = productRepository.findByIsActiveTrueAndInventoryCountGreaterThan(0);
        
        return productsInStock.stream()
                .flatMap(product -> product.getCategories().stream())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
    // Add this method to your ProductServiceImpl class

    @Override
    public List<String> getProductCategories() {
        List<Product> activeProducts = productRepository.findByIsActiveTrue(Pageable.unpaged()).getContent();

        return activeProducts.stream()
                .flatMap(product -> product.getCategories().stream())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}