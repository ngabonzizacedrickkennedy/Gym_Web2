// src/app/(marketing)/nutrition/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  Star, 
  Users, 
  ArrowRight,
  Search,
  Utensils,
  Heart,
  Target,
  TrendingUp
} from 'lucide-react';
import { nutritionService, NutritionPlan } from '@/services/nutritionService';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-toastify';

export default function NutritionPlansPage() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchActivePlans();
  }, []);

  const fetchActivePlans = async () => {
    try {
      const activePlans = await nutritionService.getActivePlans();
      setPlans(activePlans);
    } catch (error) {
      console.error('Failed to fetch nutrition plans:', error);
      toast.error('Failed to load nutrition plans');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'short') return matchesSearch && plan.durationDays <= 30;
    if (selectedFilter === 'medium') return matchesSearch && plan.durationDays > 30 && plan.durationDays <= 90;
    if (selectedFilter === 'long') return matchesSearch && plan.durationDays > 90;
    
    return matchesSearch;
  });

  const getDurationLabel = (days: number) => {
    if (days <= 7) return 'Weekly';
    if (days <= 30) return 'Monthly';
    if (days <= 90) return 'Quarterly';
    return 'Long-term';
  };

  const getPlanBadgeColor = (days: number) => {
    if (days <= 30) return 'bg-green-100 text-green-800';
    if (days <= 90) return 'bg-blue-100 text-blue-800';
    return 'bg-purple-100 text-purple-800';
  };

  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <Card key={`skeleton-${index}`} className="overflow-hidden">
        <CardHeader className="p-0">
          <Skeleton className="h-48 w-full" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 mb-6">
              <Utensils className="h-3 w-3 mr-1" />
              Expert Nutrition Guidance
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
              Transform Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Nutrition
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Discover personalized nutrition plans designed by certified nutritionists to help you reach your health and fitness goals.
            </p>

            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-neutral-600">Nutrition Plans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-secondary">25K+</div>
                <div className="text-sm text-neutral-600">Women Transformed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-accent1">4.8</div>
                <div className="text-sm text-neutral-600">Average Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="h-8 w-8 text-primary" />,
                title: "Health-Focused",
                description: "Plans designed to improve overall health and wellbeing"
              },
              {
                icon: <Target className="h-8 w-8 text-secondary" />,
                title: "Goal-Oriented",
                description: "Customized plans for weight loss, muscle gain, or maintenance"
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-accent1" />,
                title: "Proven Results",
                description: "Science-backed nutrition strategies that work"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-neutral-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search nutrition plans..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Plans' },
                { key: 'short', label: 'Short-term' },
                { key: 'medium', label: 'Medium-term' },
                { key: 'long', label: 'Long-term' }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={selectedFilter === filter.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nutrition Plans Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Our expert nutritionists have created these plans to help you achieve your goals with delicious, sustainable nutrition strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              renderSkeletons()
            ) : filteredPlans.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <Utensils className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No plans found</h3>
                <p className="text-neutral-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                    <CardHeader className="p-0 relative">
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Utensils className="h-16 w-16 text-primary/60" />
                      </div>
                      <Badge 
                        className={`absolute top-4 left-4 ${getPlanBadgeColor(plan.durationDays)}`}
                      >
                        {getDurationLabel(plan.durationDays)}
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                          {plan.title}
                        </h3>
                        
                        <p className="text-neutral-600 mb-4 line-clamp-3">
                          {plan.description}
                        </p>

                        <div className="space-y-2 mb-6">
                          <div className="flex items-center text-sm text-neutral-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {plan.durationDays} days program
                          </div>
                          <div className="flex items-center text-sm text-neutral-600">
                            <Users className="h-4 w-4 mr-2" />
                            By {plan.nutritionist?.profile?.firstName} {plan.nutritionist?.profile?.lastName}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(plan.price)}
                          </div>
                          <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm ml-1">4.8</span>
                          </div>
                        </div>

                        <Button className="w-full" asChild>
                          <Link href={`/nutrition/${plan.id}`}>
                            View Details
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Nutrition?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of women who have already started their journey to better health with our expert-designed nutrition plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Get Started Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary" asChild>
                <Link href="/contact">
                  Talk to a Nutritionist
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}