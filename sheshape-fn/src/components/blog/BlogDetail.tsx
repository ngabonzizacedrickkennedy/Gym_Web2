'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BlogCard } from './BlogCard';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft, 
  Facebook, 
  Twitter, 
  Linkedin,
  Copy,
  Check
} from 'lucide-react';
import { formatDate, parseMarkdown } from '@/lib/utils';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import { toast } from 'react-toastify';

interface BlogDetailProps {
  postId: number;
}

export function BlogDetail({ postId }: BlogDetailProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch blog post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const postData = await blogService.getPostById(postId);
        setPost(postData);
        
        // Fetch related posts from the same category
        if (postData.category) {
          setIsLoadingRelated(true);
          const relatedResponse = await blogService.getPostsByCategory(
            postData.category, 
            0, 
            3
          );
          // Filter out the current post from related posts
          const filtered = relatedResponse.content.filter(p => p.id !== postId);
          setRelatedPosts(filtered.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch blog post:', error);
        toast.error('Failed to load blog post');
      } finally {
        setIsLoading(false);
        setIsLoadingRelated(false);
      }
    };

    fetchPost();
  }, [postId]);

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
      console.log(error)
    }
  };

  // Share handlers
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <p className="text-muted-foreground mb-6">
          The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    );
  }

  const authorName = post.author?.profile?.firstName && post.author?.profile?.lastName
    ? `${post.author.profile.firstName} ${post.author.profile.lastName}`
    : post.author?.username || 'Anonymous';

  const readTime = blogService.calculateReadTime(post.content);
  const categoryInfo = blogService.getCategories().find(cat => cat.value === post.category);

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>

      {/* Header Section */}
      <motion.header 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Category Badge */}
        <Badge className={`mb-4 ${blogService.getCategoryColor(post.category)}`}>
          {categoryInfo?.label || post.category}
        </Badge>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
          {/* Author */}
          <div className="flex items-center">
            <div className="relative h-10 w-10 rounded-full mr-3 overflow-hidden bg-gray-200">
              {post.author?.profile?.profilePictureUrl ? (
                <Image
                  src={post.author.profile.profilePictureUrl}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-foreground">{authorName}</div>
              <div className="text-sm">Fitness Expert</div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>

          {/* Read Time */}
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>{readTime}</span>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Share:</span>
          <Button variant="outline" size="sm" onClick={shareOnFacebook}>
            <Facebook className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={shareOnTwitter}>
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={shareOnLinkedIn}>
            <Linkedin className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={copyLink}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </motion.header>

      {/* Featured Image */}
      {post.imageUrl && (
        <motion.div 
          className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      )}

      {/* Content */}
      <motion.div 
  className="prose prose-lg max-w-none mb-12"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.3 }}
>
  <div 
    className="blog-content space-y-4"
    dangerouslySetInnerHTML={{ 
      __html: parseMarkdown(post.content)
    }} 
  />
</motion.div>

      <Separator className="my-12" />

      {/* Author Bio Section */}
      {post.author?.profile && (
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">About the Author</h3>
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {post.author.profile.profilePictureUrl ? (
                  <Image
                    src={post.author.profile.profilePictureUrl}
                    alt={authorName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">{authorName}</h4>
                <p className="text-muted-foreground">
                  {post.author.profile.bio || 
                   "Passionate about helping people achieve their fitness goals through evidence-based training and nutrition guidance."}
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
          {isLoadingRelated ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost, index) => (
                <BlogCard
                  key={relatedPost.id}
                  post={relatedPost}
                  index={index}
                  showAuthor={false}
                />
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* Call to Action */}
      <motion.section 
        className="bg-primary/5 rounded-lg p-8 text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3 className="text-2xl font-semibold mb-4">Ready to Start Your Fitness Journey?</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of others who have transformed their lives with our personalized 
          fitness programs and expert guidance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/programs">Explore Programs</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/blog">Read More Articles</Link>
          </Button>
        </div>
      </motion.section>
    </article>
  );
}