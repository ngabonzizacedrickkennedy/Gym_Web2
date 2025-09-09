package com.sheshape.controller;

import com.sheshape.dto.ProductDto;
import com.sheshape.service.ProductCategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/product-categories")
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    public ProductCategoryController(ProductCategoryService productCategoryService) {
        this.productCategoryService = productCategoryService;
    }

    @GetMapping
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = productCategoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/with-counts")
    public ResponseEntity<Map<String, Long>> getCategoriesWithProductCounts() {
        Map<String, Long> categoriesWithCounts = productCategoryService.getCategoriesWithProductCounts();
        return ResponseEntity.ok(categoriesWithCounts);
    }

    @GetMapping("/{category}/products")
    public ResponseEntity<Page<ProductDto>> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<ProductDto> products = productCategoryService.getProductsByCategory(category, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getCategoryStatistics() {
        Map<String, Object> statistics = productCategoryService.getCategoryStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/search")
    public ResponseEntity<List<String>> searchCategories(@RequestParam String query) {
        List<String> categories = productCategoryService.searchCategories(query);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<String>> getPopularCategories(
            @RequestParam(defaultValue = "10") int limit) {
        List<String> popularCategories = productCategoryService.getPopularCategories(limit);
        return ResponseEntity.ok(popularCategories);
    }

    @GetMapping("/in-stock")
    public ResponseEntity<List<String>> getCategoriesInStock() {
        List<String> categoriesInStock = productCategoryService.getCategoriesWithStock();
        return ResponseEntity.ok(categoriesInStock);
    }
}