'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BlogCard } from '@/components/blog/BlogCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ArrowRight, BookOpen } from 'lucide-react';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import { toast } from 'react-toastify';

interface BlogSectionProps {
  className?: string;
  maxPosts?: number;
  showViewAll?: boolean;
}

export function BlogSection({ 
  className = '', 
  maxPosts = 3, 
  showViewAll = true 
}: BlogSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setIsLoading(true);
        const featuredPosts = await blogService.getFeaturedPosts(maxPosts);
        setPosts(featuredPosts);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
        toast.error('Failed to load blog posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, [maxPosts]);

  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            <span className="text-primary font-medium">Latest Insights</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Expert Fitness & Wellness Tips
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Stay informed with our latest articles on fitness, nutrition, and wellness. 
            Get expert advice to help you achieve your health goals.
          </p>
        </motion.div>

        {/* Blog Posts */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Articles Yet</h3>
            <p className="text-muted-foreground">
              Check back soon for the latest fitness and wellness insights.
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {posts.map((post, index) => (
              <BlogCard
                key={post.id}
                post={post}
                index={index}
                showAuthor={true}
                showExcerpt={true}
              />
            ))}
          </motion.div>
        )}

        {/* View All Button */}
        {showViewAll && posts.length > 0 && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button asChild variant="outline" size="lg" className="group">
              <Link href="/blog">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}