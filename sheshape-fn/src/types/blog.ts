// src/types/blog.ts
export interface BlogPost {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  category: string;
  isPublished: boolean;
  publishedAt: string | null;
  authorId: number;
  author?: BlogAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface BlogAuthor {
  id: number;
  username: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
    bio?: string;
  };
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

export interface BlogCategory {
  value: string;
  label: string;
  count?: number;
}

export interface BlogPostFormData {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
}

export interface BlogSearchParams {
  query?: string;
  category?: string;
  page?: number;
  size?: number;
  sortBy?: 'publishedAt' | 'createdAt' | 'title';
  direction?: 'asc' | 'desc';
}

export interface BlogPostCard {
  id: number;
  title: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  author: string;
  authorImage?: string;
  authorRole?: string;
  publishedAt: string;
  readTime: string;
}