// src/services/productService.ts
import { api } from '@/lib/api';

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  fileKey: string;
  isMain: boolean;
  position: number;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  inventoryCount: number;
  isActive: boolean;
  categories: string[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  inStock?: boolean;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  inventoryCount: number;
  isActive: boolean;
  categories: string[];
  images: Array<{
    id?: number;
    imageUrl: string;
    fileKey: string;
    isMain: boolean;
    position: number;
  }>;
}

export const productService = {
  // Get products with filters (compatible with Spring Boot backend)
  async getProducts(filters: ProductFilters = {}): Promise<{ products: Product[], totalPages: number, totalCount: number }> {
    const params: any = {};
    
    // Map frontend filters to backend parameters
    if (filters.page) params.page = filters.page - 1; // Convert to 0-based indexing
    if (filters.limit) params.size = filters.limit;
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.inStock !== undefined) params.inStock = filters.inStock;
    
    // Handle sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          params.sortBy = 'price';
          params.direction = 'asc';
          break;
        case 'price_desc':
          params.sortBy = 'price';
          params.direction = 'desc';
          break;
        case 'newest':
          params.sortBy = 'createdAt';
          params.direction = 'desc';
          break;
        case 'popular':
          params.sortBy = 'name'; // Fallback to name sorting
          params.direction = 'asc';
          break;
        default:
          params.sortBy = 'createdAt';
          params.direction = 'desc';
      }
    } else {
      // Default sorting
      params.sortBy = 'createdAt';
      params.direction = 'desc';
    }
    
    try {
      const response = await api.get('/api/products', { params });
      return {
        products: response.data.content || response.data,
        totalPages: response.data.totalPages || 1,
        totalCount: response.data.totalElements || response.data.length || 0
      };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },

  // Simplified method for backward compatibility
  async getProductsSimple(page = 0, size = 10, sortBy = 'name', direction = 'asc', category?: string): Promise<ProductsResponse> {
    const params: any = { page, size, sortBy, direction };
    if (category) {
      params.category = category;
    }
    
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  // Get all products for admin (includes inactive products)
  async getAllProducts(page = 0, size = 10, sortBy = 'name', direction = 'asc'): Promise<ProductsResponse> {
    const response = await api.get('/api/products/all', {
      params: { page, size, sortBy, direction }
    });
    return response.data;
  },

  // Get product by ID
  async getProductById(id: number): Promise<Product> {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Alias for backwards compatibility
  async getProduct(id: number): Promise<Product> {
    return this.getProductById(id);
  },

  // Search products
  async searchProducts(keyword: string, page = 0, size = 10): Promise<ProductsResponse> {
    const response = await api.get('/api/products/search', {
      params: { keyword, page, size }
    });
    return response.data;
  },

  // Get products by category
  async getProductsByCategory(category: string, page = 0, size = 10): Promise<ProductsResponse> {
    const response = await api.get('/api/products/category', {
      params: { category, page, size }
    });
    return response.data;
  },

  // Get featured products
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const response = await api.get('/api/products/featured', {
      params: { size: limit }
    });
    return response.data.content || response.data;
  },

  // Get product categories
  async getProductCategories(): Promise<string[]> {
    try {
       const response = await api.get('/api/product-categories'); 
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Return fallback categories
      return ['Clothing', 'Equipment', 'Accessories', 'Nutrition', 'Other'];
    }
  },

  // Admin endpoints - Create product
  async createProduct(productData: ProductFormData): Promise<Product> {
    const formattedData = {
      name: productData.name,
      description: productData.description || "",
      price: productData.price,
      discountPrice: productData.discountPrice,
      inventoryCount: productData.inventoryCount,
      isActive: productData.isActive,
      categories: productData.categories,
      images: productData.images.map((img, index) => ({
        id: img.id && img.id > 0 ? img.id : undefined,
        imageUrl: img.imageUrl,
        fileKey: img.fileKey,
        isMain: img.isMain,
        position: img.position !== undefined ? img.position : index
      }))
    };
    
    const response = await api.post('/api/products', formattedData);
    return response.data;
  },

  // Admin endpoints - Update product
  async updateProduct(id: number, productData: ProductFormData): Promise<Product> {
    const formattedData = {
      name: productData.name,
      description: productData.description || "",
      price: productData.price,
      discountPrice: productData.discountPrice,
      inventoryCount: productData.inventoryCount,
      isActive: productData.isActive,
      categories: productData.categories,
      images: productData.images.map((img, index) => ({
        id: img.id && img.id > 0 ? img.id : undefined,
        imageUrl: img.imageUrl,
        fileKey: img.fileKey,
        isMain: img.isMain,
        position: img.position !== undefined ? img.position : index
      }))
    };
    
    const response = await api.put(`/api/products/${id}`, formattedData);
    return response.data;
  },

  // Admin endpoints - Delete product
  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/api/products/${id}`);
  },

  // Admin endpoints - Activate product
  async activateProduct(id: number): Promise<Product> {
    const response = await api.put(`/api/products/${id}/activate`);
    return response.data;
  },

  // Admin endpoints - Deactivate product
  async deactivateProduct(id: number): Promise<Product> {
    const response = await api.put(`/api/products/${id}/deactivate`);
    return response.data;
  },

  // Upload product image (admin only)
  async uploadProductImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await api.post('/api/uploads/product-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.imageUrl;
    } catch (error: any) {
      console.error('Product image upload failed:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Permission denied. Admin role required.');
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Maximum size is 10MB.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Image upload failed. Please try again.');
      }
    }
  }
};