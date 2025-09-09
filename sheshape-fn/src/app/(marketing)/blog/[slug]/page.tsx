// src/app/(marketing)/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { BlogPostClient } from './BlogPostClient';
import { blogService } from '@/services/blogService';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const postId = extractIdFromSlug(slug);
  
  if (!postId) {
    notFound();
  }

  // Try to fetch the post on the server side for SEO
  // If it fails, we'll let the client component handle it
  let initialPost = null;
  try {
    initialPost = await blogService.getPostById(postId);
    if (!initialPost.isPublished) {
      notFound();
    }
  } catch (error) {
    // Let client component handle the error
    console.error('Server-side fetch failed:', error);
  }

  return <BlogPostClient slug={slug} initialPost={initialPost} />;
}

// Generate metadata for SEO (server-side only)
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  
  try {
    // Extract ID from slug
    const postId = extractIdFromSlug(slug);
    
    if (!postId) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.'
      };
    }

    const post = await blogService.getPostById(postId);
    
    if (!post.isPublished) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.'
      };
    }

    const excerpt = blogService.extractExcerpt(post.content);
    const categoryInfo = blogService.getCategories().find(cat => cat.value === post.category);

    return {
      title: `${post.title} | SheShape Blog`,
      description: excerpt,
      keywords: [
        'fitness',
        'wellness',
        'nutrition',
        post.category,
        categoryInfo?.label || '',
        'sheShape'
      ].filter(Boolean).join(', '),
      authors: post.author?.username ? [{ name: post.author.username }] : [],
      openGraph: {
        title: post.title,
        description: excerpt,
        type: 'article',
        publishedTime: post.publishedAt || post.createdAt,
        modifiedTime: post.updatedAt,
        authors: post.author?.username ? [post.author.username] : [],
        images: post.imageUrl ? [
          {
            url: post.imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: excerpt,
        images: post.imageUrl ? [post.imageUrl] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post | SheShape',
      description: 'Read our latest fitness and wellness articles on SheShape.'
    };
  }
}