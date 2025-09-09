// src/app/(marketing)/blog/[slug]/BlogPostClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { BlogDetail } from '@/components/blog/BlogDetail';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { blogService } from '@/services/blogService';
import { AxiosError } from 'axios';
import type { BlogPost } from '@/types/blog';

interface BlogPostClientProps {
  slug: string;
  initialPost: BlogPost | null;
}

// Extract ID from slug (assuming slug format is "id-title" or just "id")
function extractIdFromSlug(slug: string): number | null {
  // Try to parse the entire slug as a number first
  const directId = parseInt(slug);
  if (!isNaN(directId)) {
    return directId;
  }

  // If that fails, try to extract ID from the beginning of the slug
  const match = slug.match(/^(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }

  return null;
}

export function BlogPostClient({ slug, initialPost }: BlogPostClientProps) {
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [isLoading, setIsLoading] = useState(!initialPost);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have the post from server-side, don't fetch again
    if (initialPost) {
      return;
    }

    const fetchPost = async () => {
      const postId = extractIdFromSlug(slug);
      
      if (!postId) {
        setError('Invalid post ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const postData = await blogService.getPostById(postId);
        
        // Check if post is published (for public access)
        if (!postData.isPublished) {
          setError('Post not found or not published');
          setIsLoading(false);
          return;
        }
        
        setPost(postData);
      } catch (error) {
  console.error('Failed to fetch blog post:', error);

  if (error instanceof AxiosError) {
    if (error.response?.status === 404) {
      setError('Post not found');
    } else if (error.response?.status === 403) {
      setError('Access denied');
    } else {
      setError('Failed to load post');
    }
  } else {
    setError('An unexpected error occurred');
  }
} finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug, initialPost]);

  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    ...(post ? [{ label: post.title, href: `/blog/${slug}` }] : [])
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state or redirect to 404
  if (error || !post) {
    notFound();
  }

  const postId = extractIdFromSlug(slug);
  if (!postId) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <BlogDetail postId={postId} />
      </div>
    </div>
  );
}