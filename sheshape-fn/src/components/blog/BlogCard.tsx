'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
  showAuthor?: boolean;
  showExcerpt?: boolean;
  className?: string;
}

export function BlogCard({ 
  post, 
  index = 0, 
  showAuthor = true, 
  showExcerpt = true, 
  className = '' 
}: BlogCardProps) {
  // Generate excerpt from content
  const excerpt = blogService.extractExcerpt(post.content);
  const readTime = blogService.calculateReadTime(post.content);
  
  // Get author display name
  const authorName = post.author?.profile?.firstName && post.author?.profile?.lastName
    ? `${post.author.profile.firstName} ${post.author.profile.lastName}`
    : post.author?.username || 'Anonymous';

  // Get author role based on user data (you might want to add role to author interface)
  const getAuthorRole = () => {
    // This could be enhanced to show actual role from user data
    return 'Fitness Expert';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={className}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.imageUrl || '/images/blog-placeholder.jpg'}
            alt={post.title}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105`}
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 to-transparent" />
          <Badge 
            className={`absolute top-3 left-3 ${blogService.getCategoryColor(post.category)}`}
          >
            {blogService.getCategories().find(cat => cat.value === post.category)?.label || post.category}
          </Badge>
        </div>

        <CardContent className="pt-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-bold mb-2 line-clamp-2 flex-shrink-0">
            <Link 
              href={`/blog/${post.id}`}
              className="hover:text-primary transition-colors"
            >
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          {showExcerpt && (
            <p className="text-neutral-600 text-sm mb-4 line-clamp-3 flex-1">
              {excerpt}
            </p>
          )}

          {/* Author Info */}
          {showAuthor && (
            <div className="flex items-center mb-3 flex-shrink-0">
              <div className="relative h-8 w-8 rounded-full mr-3 overflow-hidden bg-gray-200">
                {post.author?.profile?.profilePictureUrl ? (
                  <Image
                    src={post.author.profile.profilePictureUrl}
                    alt={authorName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium">{authorName}</div>
                <div className="text-xs text-neutral-500">{getAuthorRole()}</div>
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="flex items-center text-xs text-neutral-500 flex-shrink-0">
            <div className="flex items-center mr-4">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{readTime}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex-shrink-0">
          <Link 
            href={`/blog/${post.id}`}
            className="text-primary font-medium text-sm flex items-center hover:underline group/link"
          >
            Read More
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}