// src/services/blogService.ts
import { api } from '@/lib/api';
import { extractTextFromMarkdown } from '@/lib/utils';

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  category: string;
  isPublished: boolean;
  publishedAt: string | null;
  authorId: number;
  author?: {
    id: number;
    username: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      profilePictureUrl?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostsResponse {
  content: BlogPost[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface BlogPostFormData {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
}

export const blogService = {
  // Get all published blog posts (public)
  async getPublishedPosts(page = 0, size = 10, sortBy = 'publishedAt', direction = 'desc'): Promise<BlogPostsResponse> {
    const response = await api.get('/api/blog/posts', {
      params: { page, size, sortBy, direction }
    });
    return response.data;
  },

  // Get blog post by ID (public for published posts)
  async getPostById(id: number): Promise<BlogPost> {
    const response = await api.get(`/api/blog/posts/${id}`);
    return response.data;
  },

  // Get posts by category (public) - FIXED URL
  async getPostsByCategory(category: string, page = 0, size = 10): Promise<BlogPostsResponse> {
    const response = await api.get(`/api/blog/category/${category}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Search posts (public) - FIXED URL
  async searchPosts(keyword: string, page = 0, size = 10): Promise<BlogPostsResponse> {
    const response = await api.get('/api/blog/search', {
      params: { keyword, page, size }
    });
    return response.data;
  },

  // Get featured/latest posts for homepage
  async getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
    const response = await api.get('/api/blog/posts', {
      params: { page: 0, size: limit, sortBy: 'publishedAt', direction: 'desc' }
    });
    return response.data.content;
  },

  // Admin endpoints - Get all posts (including unpublished)
  async getAllPosts(page = 0, size = 10, sortBy = 'createdAt', direction = 'desc'): Promise<BlogPostsResponse> {
    const response = await api.get('/api/blog/posts/all', {
      params: { page, size, sortBy, direction }
    });
    return response.data;
  },

  // Admin endpoints - Create post
  async createPost(postData: BlogPostFormData): Promise<BlogPost> {
    const response = await api.post('/api/blog/posts', postData);
    return response.data;
  },

  // Admin endpoints - Update post
  async updatePost(id: number, postData: BlogPostFormData): Promise<BlogPost> {
    const response = await api.put(`/api/blog/posts/${id}`, postData);
    return response.data;
  },

  // Admin endpoints - Publish post
  async publishPost(id: number): Promise<BlogPost> {
    const response = await api.put(`/api/blog/posts/${id}/publish`);
    return response.data;
  },

  // Admin endpoints - Unpublish post
  async unpublishPost(id: number): Promise<BlogPost> {
    const response = await api.put(`/api/blog/posts/${id}/unpublish`);
    return response.data;
  },

  // Admin endpoints - Delete post
  async deletePost(id: number): Promise<void> {
    await api.delete(`/api/blog/posts/${id}`);
  },

  // Get posts by author
  async getPostsByAuthor(authorId: number): Promise<BlogPost[]> {
    const response = await api.get(`/api/blog/author/${authorId}/posts`);
    return response.data;
  },

  // Utility functions
  extractExcerpt(content: string, maxLength = 160): string {
    const plainText = extractTextFromMarkdown(content);
    if (plainText.length <= maxLength) {
      return plainText;
    }
    return plainText.substring(0, maxLength).trim() + '...';
  },

  // Calculate read time based on word count
  calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    // Better word counting that handles markdown
    const wordCount = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  },

  getCategories() {
    return [
      { value: 'fitness', label: 'Fitness' },
      { value: 'nutrition', label: 'Nutrition' },
      { value: 'wellness', label: 'Wellness' },
      { value: 'mental-health', label: 'Mental Health' },
      { value: 'recipes', label: 'Recipes' },
      { value: 'workouts', label: 'Workouts' },
      { value: 'lifestyle', label: 'Lifestyle' },
      { value: 'tips', label: 'Tips & Advice' }
    ];
  },

  getCategoryLabel(categoryValue: string): string {
    const category = this.getCategories().find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  },

  // Get category color for badges
  getCategoryColor(category: string): string {
    const categoryColors: Record<string, string> = {
      fitness: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      nutrition: 'bg-green-100 text-green-800 hover:bg-green-200',
      wellness: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'mental-health': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      recipes: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      workouts: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
      lifestyle: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      tips: 'bg-red-100 text-red-800 hover:bg-red-200',
    };
    return categoryColors[category] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};