'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { formatPrice } from '@/lib/utils';

// Services
import { productService } from '@/services/productService';

// Types
import { Product, ProductFilters } from '@/types/models';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

// Icons
import { 
  Search, 
  ShoppingCart,
  Heart,
  Grid3X3,
  List,
  Star,
  Package
} from 'lucide-react';

// Components
import Link from 'next/link';
import Image from 'next/image';

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<number[]>([]);
  
  // Helper function to validate sort parameter
  const getValidSortValue = (sortParam: string | null): 'price_asc' | 'price_desc' | 'newest' | 'popular' => {
    if (sortParam && ['price_asc', 'price_desc', 'newest', 'popular'].includes(sortParam)) {
      return sortParam as 'price_asc' | 'price_desc' | 'newest' | 'popular';
    }
    return 'newest';
  };

  // Filters state
  const [filters, setFilters] = useState<ProductFilters>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    sort: getValidSortValue(searchParams.get('sort')),
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
  });
  
  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProducts(filters);
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const categories = await productService.getProductCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback categories
      setCategories(['Clothing', 'Equipment', 'Accessories', 'Nutrition', 'Other']);
    }
  }, []);
  
  // Update URL with current filters
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.inStock) params.set('inStock', 'true');
    
    const queryString = params.toString();
    const newUrl = queryString ? `/shop?${queryString}` : '/shop';
    router.replace(newUrl);
  }, [filters, router]);
  
  // Effects
  useEffect(() => {
    fetchProducts();
    updateURL();
  }, [fetchProducts, updateURL]);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Handlers
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      category: value === 'all' ? '' : value, 
      page: 1 
    }));
  };
  
  const handleSortChange = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      sort: value as 'price_asc' | 'price_desc' | 'newest' | 'popular', 
      page: 1 
    }));
  };
  
  const handlePriceRangeChange = (min: string, max: string) => {
    setFilters(prev => ({ 
      ...prev, 
      minPrice: min ? parseFloat(min) : undefined,
      maxPrice: max ? parseFloat(max) : undefined,
      page: 1 
    }));
  };
  
  const handleInStockToggle = (inStock: boolean) => {
    setFilters(prev => ({ 
      ...prev, 
      inStock: inStock || undefined, 
      page: 1 
    }));
  };
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  const getMainImageUrl = (product: Product) => {
    if (!product.images || product.images.length === 0) {
      return '/images/product-placeholder.jpg';
    }
    
    const mainImage = product.images.find(img => img.isMain);
    return mainImage ? mainImage.imageUrl : product.images[0].imageUrl;
  };
  
  const getStockBadge = (product: Product) => {
    if (product.inventoryCount === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (product.inventoryCount <= 5) {
      return <Badge variant="secondary">Low Stock</Badge>;
    } else {
      return <Badge variant="default">In Stock</Badge>;
    }
  };
  
  const renderProductCard = (product: Product) => (
    <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={getMainImageUrl(product)}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart 
                className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </Button>
          </div>
          {product.discountPrice && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive">
                {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <Link href={`/shop/${product.id}`} className="hover:underline">
              <h3 className="font-semibold line-clamp-2">{product.name}</h3>
            </Link>
            {getStockBadge(product)}
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center gap-2">
            {product.categories.map(category => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {product.discountPrice ? (
                <>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">4.5</span>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            disabled={product.inventoryCount === 0}
            onClick={() => {
              // Add to cart logic here
              toast.success('Added to cart!');
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inventoryCount === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderProductList = (product: Product) => (
    <Card key={product.id} className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={getMainImageUrl(product)}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <Link href={`/shop/${product.id}`} className="hover:underline">
                <h3 className="font-semibold">{product.name}</h3>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart 
                  className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center gap-2">
              {product.categories.map(category => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
              {getStockBadge(product)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {product.discountPrice ? (
                  <>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.discountPrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">4.5</span>
                </div>
                
                <Button 
                  size="sm"
                  disabled={product.inventoryCount === 0}
                  onClick={() => {
                    // Add to cart logic here
                    toast.success('Added to cart!');
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.inventoryCount === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 py-10">
        <h1 className="text-3xl font-bold mb-2">Shop</h1>
        <p className="text-gray-600">Discover our fitness and wellness products</p>
      </div>
      
      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Sort */}
          <Select value={filters.sort || 'newest'} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
          
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Additional Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Price Range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Price:</span>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => handlePriceRangeChange(e.target.value, filters.maxPrice?.toString() || '')}
              className="w-20"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => handlePriceRangeChange(filters.minPrice?.toString() || '', e.target.value)}
              className="w-20"
            />
          </div>
          
          {/* In Stock Filter */}
          <Button
            variant={filters.inStock ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleInStockToggle(!filters.inStock)}
          >
            <Package className="h-4 w-4 mr-2" />
            In Stock Only
          </Button>
          
          {/* Results Count */}
          <div className="text-sm text-gray-600 ml-auto">
            {totalCount} {totalCount === 1 ? 'product' : 'products'} found
          </div>
        </div>
      </div>
      
      {/* Products */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="p-0">
                <Skeleton className="aspect-square rounded-t-lg" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
        }>
          {products.map(product => 
            viewMode === 'grid' ? renderProductCard(product) : renderProductList(product)
          )}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, filters.page! - 1))}
                  className={filters.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={page === filters.page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, filters.page! + 1))}
                  className={filters.page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}