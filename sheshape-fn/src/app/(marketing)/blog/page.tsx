// src/app/(marketing)/blog/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlogList } from '@/components/blog/BlogList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { BookOpen, TrendingUp } from 'lucide-react';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogPage() {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    categoriesCount: 8,
    readersCount: '10K+',
    expertAuthors: 12
  });

  const categories = blogService.getCategories();

  // Fetch featured posts for hero section
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setIsLoadingFeatured(true);
        const posts = await blogService.getFeaturedPosts(3);
        setFeaturedPosts(posts);
        
        // Get total posts count from the first fetch
        const response = await blogService.getPublishedPosts(0, 1);
        setStats(prev => ({ ...prev, totalPosts: response.totalElements }));
      } catch (error) {
        console.error('Failed to fetch featured posts:', error);
        toast.error('Failed to load featured posts');
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' }
  ];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/3 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              <BookOpen className="w-4 h-4 mr-2" />
              Expert Insights
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Fitness & Wellness Blog
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover expert tips, workout routines, nutrition advice, and inspiring success stories 
              to fuel your fitness journey and transform your lifestyle.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="text-2xl font-bold text-primary mb-1">{stats.totalPosts}+</div>
                <div className="text-sm text-muted-foreground">Articles</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-2xl font-bold text-primary mb-1">{stats.categoriesCount}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="text-2xl font-bold text-primary mb-1">{stats.readersCount}</div>
                <div className="text-sm text-muted-foreground">Readers</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-2xl font-bold text-primary mb-1">{stats.expertAuthors}</div>
                <div className="text-sm text-muted-foreground">Experts</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Featured Posts Preview */}
          {!isLoadingFeatured && featuredPosts.length > 0 && (
            <motion.div 
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h2 className="text-2xl font-semibold text-center mb-8">Latest Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="aspect-video relative">
                        <Image
                            src={post.imageUrl || '/images/blog-placeholder.jpg'}
                            alt={post.title}
                            fill
                            className="object-cover"
                            />
                      <Badge className={`absolute top-3 left-3 ${blogService.getCategoryColor(post.category)}`}>
                        {categories.find(cat => cat.value === post.category)?.label || post.category}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {blogService.extractExcerpt(post.content)}
                      </p>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/blog/${post.id}`}>Read More →</a>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Explore Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dive deep into specific topics that interest you most. From beginner-friendly 
              guides to advanced training techniques.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {categories.slice(0, 8).map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
              >
                <Badge 
                  variant="outline" 
                  className={`w-full py-3 px-4 text-center justify-center transition-all hover:shadow-md ${blogService.getCategoryColor(category.value)}`}
                  onClick={() => {
                    const element = document.getElementById('blog-list');
                    element?.scrollIntoView({ behavior: 'smooth' });
                    // You could also trigger a category filter here
                  }}
                >
                  {category.label}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Blog List */}
      <section id="blog-list" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">All Articles</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Browse through our complete collection of articles, use filters to find 
                exactly what you&apos;re looking for, or search for specific topics.
              </p>
            </div>
            
            <BlogList 
              showFilters={true}
              showSearch={true}
              pageSize={9}
            />
          </motion.div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <TrendingUp className="w-12 h-12 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get the latest fitness tips, workout routines, and nutrition advice 
              delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button size="lg" asChild className="flex-1">
                <a href="#newsletter">Subscribe to Newsletter</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/programs">View Programs</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}