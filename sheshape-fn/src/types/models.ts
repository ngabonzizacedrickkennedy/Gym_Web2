// src/types/models.ts - Updated Product types
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

export interface ProductsResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
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