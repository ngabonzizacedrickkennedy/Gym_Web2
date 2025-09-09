'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlogCard } from './BlogCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { blogService } from '@/services/blogService';
import type { BlogPost, BlogPostsResponse, BlogSearchParams } from '@/types/blog';
import { toast } from 'react-toastify';

interface BlogListProps {
  initialPosts?: BlogPost[];
  showFilters?: boolean;
  showSearch?: boolean;
  pageSize?: number;
  className?: string;
}

export function BlogList({ 
  initialPosts, 
  showFilters = true, 
  showSearch = true, 
  pageSize = 9,
  className = '' 
}: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts || []);
  const [isLoading, setIsLoading] = useState(!initialPosts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchParams, setSearchParams] = useState<BlogSearchParams>({
    query: '',
    category: '',
    page: 0,
    size: pageSize,
    sortBy: 'publishedAt',
    direction: 'desc'
  });
  const [hasMore, setHasMore] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  const categories = blogService.getCategories();

  // Fetch posts
  const fetchPosts = async (params: BlogSearchParams, append = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      let response: BlogPostsResponse;

      if (params.query) {
        response = await blogService.searchPosts(
          params.query,
          params.page,
          params.size
        );
      } else if (params.category) {
        response = await blogService.getPostsByCategory(
          params.category,
          params.page,
          params.size
        );
      } else {
        response = await blogService.getPublishedPosts(
          params.page,
          params.size,
          params.sortBy,
          params.direction
        );
      }

      if (append) {
        setPosts(prev => [...prev, ...response.content]);
      } else {
        setPosts(response.content);
      }

      setTotalPosts(response.totalElements);
      setHasMore(!response.last);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!initialPosts) {
      fetchPosts(searchParams);
    } else {
      setTotalPosts(initialPosts.length);
      setHasMore(false);
    }
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    const newParams = { ...searchParams, query, page: 0 };
    setSearchParams(newParams);
    fetchPosts(newParams);
  };

  // Handle category filter
  const handleCategoryFilter = (category: string) => {
    const newParams = { ...searchParams, category, page: 0 };
    setSearchParams(newParams);
    fetchPosts(newParams);
  };

  // Handle sort change
  const handleSortChange = (sortBy: 'publishedAt' | 'title' | 'createdAt') => {
    const newParams = { ...searchParams, sortBy, page: 0 };
    setSearchParams(newParams);
    fetchPosts(newParams);
  };

  // Load more posts
  const loadMorePosts = () => {
    if (!hasMore || isLoadingMore) return;
    
    const newParams = { ...searchParams, page: searchParams.page! + 1 };
    setSearchParams(newParams);
    fetchPosts(newParams, true);
  };

  // Clear filters
  const clearFilters = () => {
    const newParams = {
      query: '',
      category: '',
      page: 0,
      size: pageSize,
      sortBy: 'publishedAt' as const,
      direction: 'desc' as const
    };
    setSearchParams(newParams);
    fetchPosts(newParams);
  };

  const hasActiveFilters = searchParams.query || searchParams.category;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters Section */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blog posts..."
                className="pl-10"
                value={searchParams.query}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          )}

          {/* Filters Row */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <Select
                value={searchParams.category || "all"}
                onValueChange={(value) => handleCategoryFilter(value === "all" ? "" : value)}
              >
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={searchParams.sortBy}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publishedAt">Latest</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {searchParams.query && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchParams.query}
                  <button
                    onClick={() => handleSearch('')}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchParams.category && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(cat => cat.value === searchParams.category)?.label}
                  <button
                    onClick={() => handleCategoryFilter('')}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {totalPosts > 0 && (
          <span>
            Showing {posts.length} of {totalPosts} posts
          </span>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No posts found</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to find what you're looking for."
              : "No blog posts available at the moment."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        /* Posts Grid */
        <>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {posts.map((post, index) => (
              <BlogCard
                key={post.id}
                post={post}
                index={index}
                className="h-full"
              />
            ))}
          </motion.div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-8">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={loadMorePosts}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}