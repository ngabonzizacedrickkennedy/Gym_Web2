"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { formatPrice } from "@/lib/utils";

// Context imports - Added Step 1
import { useAuth } from "@/context/AuthContext";
import { useEnhancedCart } from "@/context/EnhancedCartContext";

// Services
import { productService } from "@/services/productService";

// Types
import { Product } from "@/types/models";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Plus,
  Minus,
  Package,
  Truck,
  Shield,
  RotateCcw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const productId = use(params);

  // Step 2: Add the hooks after existing useState declarations
  const { isAuthenticated } = useAuth();
  const { addItem } = useEnhancedCart();

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await productService.getProduct(
          Number.parseInt(productId.id)
        );
        setProduct(data);

        // Fetch related products from the same category
        if (data.categories.length > 0) {
          const relatedData = await productService.getProducts({
            category: data.categories[0],
            limit: 4,
          });
          setRelatedProducts(
            relatedData.products.filter(
              (p) => p.id !== Number.parseInt(productId.id)
            )
          );
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setError(
          "Failed to load product data. The product may not exist or may have been removed."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Handlers
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.inventoryCount || 1)) {
      setQuantity(newQuantity);
    }
  };

  // Step 3: Replace the handleAddToCart function entirely
  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        toast.error("Please log in to add items to cart");
        router.push(
          `/login?returnTo=${encodeURIComponent(window.location.pathname)}`
        );
        return;
      }

      // Add to cart using the proper cart context
      await addItem(product.id, quantity);

      // Success toast is handled in the cart context
      // Now redirect to checkout page
      router.push("/checkout");
    } catch (error) {
      toast.error("Failed to add item to cart. Please try again.");
      console.log(error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const getMainImageUrl = (product: Product, index: number = 0) => {
    if (!product.images || product.images.length === 0) {
      return "/images/product-placeholder.jpg";
    }

    return product.images[index]?.imageUrl || "/images/product-placeholder.jpg";
  };

  const getStockStatus = (product: Product) => {
    if (product.inventoryCount === 0) {
      return {
        status: "Out of Stock",
        variant: "destructive" as const,
        icon: AlertCircle,
      };
    } else if (product.inventoryCount <= 5) {
      return {
        status: `Only ${product.inventoryCount} left`,
        variant: "secondary" as const,
        icon: Package,
      };
    } else {
      return {
        status: "In Stock",
        variant: "default" as const,
        icon: CheckCircle,
      };
    }
  };

  const renderRelatedProduct = (product: Product) => (
    <Card key={product.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-square relative mb-3 rounded-lg overflow-hidden">
          <Image
            src={getMainImageUrl(product)}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <Link href={`/shop/${product.id}`} className="hover:underline">
          <h4 className="font-semibold text-sm line-clamp-2 mb-2">
            {product.name}
          </h4>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {product.discountPrice ? (
              <>
                <span className="font-bold text-primary text-sm">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-bold text-sm">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600">4.5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Product Not Found
          </h3>
          <p className="text-gray-500 mb-4">
            {error || "The product you are looking for does not exist."}
          </p>
          <Link href="/shop">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product);
  const StockIcon = stockStatus.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/shop" className="hover:text-gray-900">
            Shop
          </Link>
          <span>/</span>
          {product.categories.length > 0 && (
            <>
              <Link
                href={`/shop?category=${product.categories[0]}`}
                className="hover:text-gray-900"
              >
                {product.categories[0]}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900">{product.name}</span>
        </nav>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={getMainImageUrl(product, selectedImageIndex)}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.discountPrice && (
              <div className="absolute top-4 left-4">
                <Badge variant="destructive" className="text-sm">
                  {Math.round(
                    ((product.price - product.discountPrice) / product.price) *
                      100
                  )}
                  % OFF
                </Badge>
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image.imageUrl}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Product Header */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWishlistToggle}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isWishlisted ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                (4.5 out of 5 stars)
              </span>
              <span className="text-sm text-gray-600">•</span>
              <span className="text-sm text-gray-600">124 reviews</span>
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 mb-4">
              {product.categories.map((category) => (
                <Badge key={category} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="destructive">
                    Save {formatPrice(product.price - product.discountPrice)}
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <StockIcon className="h-5 w-5" />
            <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 min-w-16 text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.inventoryCount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-600">
                {product.inventoryCount} available
              </span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.inventoryCount === 0 || isAddingToCart}
            >
              {isAddingToCart ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>

          {/* Product Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-gray-500">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-gray-500">30-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Quality Guarantee</p>
                <p className="text-xs text-gray-500">Authentic products only</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    This high-quality product is designed to meet the needs of
                    fitness enthusiasts and wellness seekers. Made with premium
                    materials and attention to detail, it offers excellent value
                    for money.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li>• Premium quality materials</li>
                    <li>• Durable construction</li>
                    <li>• Suitable for all fitness levels</li>
                    <li>• Easy to use and maintain</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">General</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">SKU:</dt>
                        <dd>SKU-{product.id.toString().padStart(6, "0")}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Weight:</dt>
                        <dd>1.2 kg</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Dimensions:</dt>
                        <dd>25 x 15 x 10 cm</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Material:</dt>
                        <dd>High-grade plastic</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Features</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Color:</dt>
                        <dd>Multiple options</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Warranty:</dt>
                        <dd>1 year</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Origin:</dt>
                        <dd>Made in USA</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Care:</dt>
                        <dd>Easy to clean</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold">4.5</div>
                      <div className="flex items-center justify-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < 4
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">124 reviews</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-8">{rating}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${
                                  rating === 5
                                    ? 60
                                    : rating === 4
                                    ? 25
                                    : rating === 3
                                    ? 10
                                    : 3
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {rating === 5
                              ? 74
                              : rating === 4
                              ? 31
                              : rating === 3
                              ? 12
                              : rating === 2
                              ? 4
                              : 3}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Reviews */}
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="font-semibold">Sarah M.</span>
                        <span className="text-sm text-gray-600">
                          • 2 days ago
                        </span>
                      </div>
                      <p className="text-gray-600">
                        Excellent quality product! Exactly what I was looking
                        for. Fast shipping and great customer service.
                      </p>
                    </div>

                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(4)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                          <Star className="h-4 w-4 text-gray-300" />
                        </div>
                        <span className="font-semibold">Mike R.</span>
                        <span className="text-sm text-gray-600">
                          • 1 week ago
                        </span>
                      </div>
                      <p className="text-gray-600">
                        Good product overall. The quality is solid and it works
                        as expected. Would recommend to others.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(renderRelatedProduct)}
          </div>
        </div>
      )}
    </div>
  );
}
