// src/components/nutrition/NutritionPlanCard.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Clock, 
  Star, 
  Users, 
  ArrowRight,
  CheckCircle,
  Utensils,
  DollarSign
} from 'lucide-react';
import { NutritionPlan } from '@/services/nutritionService';
import { formatPrice } from '@/lib/utils';

interface NutritionPlanCardProps {
  plan: NutritionPlan;
  index?: number;
  showFullDescription?: boolean;
  showFeatures?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  onPurchase?: (planId: number) => void;
  isPurchasing?: boolean;
  className?: string;
}

export function NutritionPlanCard({
  plan,
  index = 0,
  showFullDescription = false,
  showFeatures = true,
  variant = 'default',
  onPurchase,
  isPurchasing = false,
  className = ''
}: NutritionPlanCardProps) {
  
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

  const getCardHeight = () => {
    switch (variant) {
      case 'compact': return 'h-auto';
      case 'featured': return 'h-full';
      default: return 'h-full';
    }
  };

  const getImageHeight = () => {
    switch (variant) {
      case 'compact': return 'h-32';
      case 'featured': return 'h-56';
      default: return 'h-48';
    }
  };

  const features = [
    'Personalized meal plans',
    'Shopping lists included',
    'Expert nutritionist support'
  ];

  const handlePurchaseClick = () => {
    if (onPurchase) {
      onPurchase(plan.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={className}
    >
      <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${getCardHeight()} group`}>
        <CardHeader className="p-0 relative">
          <div className={`${getImageHeight()} bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
            <Utensils className={`${variant === 'compact' ? 'h-12 w-12' : variant === 'featured' ? 'h-20 w-20' : 'h-16 w-16'} text-primary/60`} />
          </div>
          <Badge 
            className={`absolute top-4 left-4 ${getPlanBadgeColor(plan.durationDays)}`}
          >
            {getDurationLabel(plan.durationDays)}
          </Badge>
          {variant === 'featured' && (
            <Badge className="absolute top-4 right-4 bg-accent1 text-white">
              Popular
            </Badge>
          )}
        </CardHeader>

        <CardContent className={`${variant === 'compact' ? 'p-4' : 'p-6'} flex flex-col h-full`}>
          <div className="flex-grow">
            <h3 className={`${variant === 'compact' ? 'text-lg' : 'text-xl'} font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors`}>
              {plan.title}
            </h3>
            
            <p className={`text-neutral-600 mb-4 ${showFullDescription ? '' : 'line-clamp-3'} ${variant === 'compact' ? 'text-sm' : ''}`}>
              {plan.description}
            </p>

            <div className={`space-y-2 ${variant === 'compact' ? 'mb-4' : 'mb-6'}`}>
              <div className="flex items-center text-sm text-neutral-600">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                {plan.durationDays} days program
              </div>
              <div className="flex items-center text-sm text-neutral-600">
                <Users className="h-4 w-4 mr-2 text-primary" />
                By {plan.nutritionist?.profile?.firstName} {plan.nutritionist?.profile?.lastName}
              </div>
            </div>

            {/* Plan Features */}
            {showFeatures && variant !== 'compact' && (
              <div className="space-y-2 mb-6">
                {features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm text-neutral-600">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={`${variant === 'compact' ? 'text-xl' : 'text-2xl'} font-bold text-primary`}>
                {formatPrice(plan.price)}
              </div>
              <div className="flex items-center text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm ml-1">4.8</span>
              </div>
            </div>

            <div className={`${variant === 'compact' ? 'space-y-2' : 'space-y-3'}`}>
              {onPurchase ? (
                <>
                  <Button 
                    className="w-full group-hover:bg-primary/90 transition-colors" 
                    onClick={handlePurchaseClick}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? 'Processing...' : 'Purchase Plan'}
                    {!isPurchasing && <DollarSign className="h-4 w-4 ml-2" />}
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/nutrition/${plan.id}`}>
                      View Details
                    </Link>
                  </Button>
                </>
              ) : (
                <Button className="w-full group-hover:bg-primary/90 transition-colors" asChild>
                  <Link href={`/nutrition/${plan.id}`}>
                    {variant === 'compact' ? 'View' : 'Learn More'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Skeleton version for loading states
export function NutritionPlanCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'featured' }) {
  const getImageHeight = () => {
    switch (variant) {
      case 'compact': return 'h-32';
      case 'featured': return 'h-56';
      default: return 'h-48';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className={`${getImageHeight()} bg-neutral-100 animate-pulse`} />
      </CardHeader>
      <CardContent className={`${variant === 'compact' ? 'p-4' : 'p-6'}`}>
        <div className="space-y-4">
          <div className="h-6 bg-neutral-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-neutral-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-neutral-200 rounded animate-pulse w-2/3" />
          
          {variant !== 'compact' && (
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-full" />
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="h-8 bg-neutral-200 rounded animate-pulse w-20" />
            <div className="h-5 bg-neutral-200 rounded animate-pulse w-16" />
          </div>
          
          <div className="h-10 bg-neutral-200 rounded animate-pulse w-full" />
        </div>
      </CardContent>
    </Card>
  );
}