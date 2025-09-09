'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  Users, 
  CheckCircle, 
  Target,
  Calendar,
  Utensils,
  Award,
  MessageCircle,
  Shield,
  TrendingUp,
  BookOpen,
  Coffee
} from 'lucide-react';
import { nutritionService, NutritionPlan } from '@/services/nutritionService';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-toastify';
import  {useAuth}  from '@/context/AuthContext';

export default function NutritionPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const planId = parseInt(params.id as string);

  useEffect(() => {
    const fetchPlanDetails = async () => {
    if (!planId || isNaN(planId)) {
    setIsLoading(false);
    return;
    }
    try {
      const planData = await nutritionService.getPlanById(planId);
      setPlan(planData);
    } catch (error) {
      console.error('Failed to fetch plan details:', error);
      toast.error('Failed to load plan details');
    } finally {
      setIsLoading(false);
    }
  };
    fetchPlanDetails();

  }, [planId]);

  

  const handlePurchase = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsPurchasing(true);
    try {
      await nutritionService.purchasePlan(user.id, planId);
      toast.success('Plan purchased successfully!');
      router.push('/dashboard/nutrition');
    } catch (error) {
      console.error('Failed to purchase plan:', error);
      toast.error('Failed to purchase plan. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const getDurationLabel = (days: number) => {
    if (days <= 7) return 'Weekly Plan';
    if (days <= 30) return 'Monthly Plan';
    if (days <= 90) return 'Quarterly Plan';
    return 'Long-term Plan';
  };

  const getPlanFeatures = (durationDays: number) => {
    const baseFeatures = [
      'Personalized meal plans',
      'Shopping lists included',
      'Nutritionist support',
      'Progress tracking tools',
      'Recipe substitutions',
    ];

    if (durationDays > 30) {
      baseFeatures.push('Weekly check-ins', 'Plan adjustments');
    }
    if (durationDays > 90) {
      baseFeatures.push('One-on-one consultations', 'Advanced tracking');
    }

    return baseFeatures;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="text-neutral-400 mb-4">
            <Utensils className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Plan not found</h2>
          <p className="text-neutral-600 mb-6">This nutrition plan doesn&apos;t exist or has been removed.</p>
          <Button asChild>
            <Link href="/nutrition">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Nutrition Plans
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const features = getPlanFeatures(plan.durationDays);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center space-x-2 text-sm text-neutral-600">
          <Link href="/nutrition" className="hover:text-primary">Nutrition Plans</Link>
          <span>/</span>
          <span className="text-neutral-900">{plan.title}</span>
        </nav>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="p-0 relative">
                  <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Utensils className="h-24 w-24 text-primary/60" />
                  </div>
                  <Badge className="absolute top-4 left-4 bg-white/90 text-primary">
                    {getDurationLabel(plan.durationDays)}
                  </Badge>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        {plan.title}
                      </h1>
                      <div className="flex items-center text-neutral-600 text-sm">
                        <Users className="h-4 w-4 mr-1" />
                        Created by {plan.nutritionist?.profile?.firstName} {plan.nutritionist?.profile?.lastName}
                      </div>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-5 w-5 fill-current mr-1" />
                      <span className="font-semibold">4.8</span>
                      <span className="text-neutral-500 ml-1">(127 reviews)</span>
                    </div>
                  </div>

                  <p className="text-neutral-700 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <Clock className="h-6 w-6 text-primary mx-auto mb-1" />
                      <div className="text-sm font-medium">{plan.durationDays} Days</div>
                      <div className="text-xs text-neutral-500">Duration</div>
                    </div>
                    <div className="text-center">
                      <Target className="h-6 w-6 text-secondary mx-auto mb-1" />
                      <div className="text-sm font-medium">All Levels</div>
                      <div className="text-xs text-neutral-500">Difficulty</div>
                    </div>
                    <div className="text-center">
                      <Award className="h-6 w-6 text-accent1 mx-auto mb-1" />
                      <div className="text-sm font-medium">Certified</div>
                      <div className="text-xs text-neutral-500">Nutritionist</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plan Details Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="nutritionist">Nutritionist</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-primary" />
                        What You&apos;ll Get
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Plan Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <Coffee className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Flexible Meal Plans</h4>
                            <p className="text-sm text-neutral-600">Customizable meals that fit your lifestyle and preferences</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <TrendingUp className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Proven Results</h4>
                            <p className="text-sm text-neutral-600">Based on scientific research and real client success stories</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <MessageCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Expert Support</h4>
                            <p className="text-sm text-neutral-600">Direct access to your nutritionist for questions and guidance</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="meal-plans">
                          <AccordionTrigger>Personalized Meal Plans</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-sm text-neutral-600">
                              <p>• Custom meal plans based on your dietary preferences and restrictions</p>
                              <p>• Detailed recipes with step-by-step instructions</p>
                              <p>• Portion control guidance and calorie breakdowns</p>
                              <p>• Meal prep tips and batch cooking strategies</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="shopping">
                          <AccordionTrigger>Smart Shopping Lists</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-sm text-neutral-600">
                              <p>• Automatically generated shopping lists for each week</p>
                              <p>• Organized by grocery store sections for efficiency</p>
                              <p>• Budget-friendly ingredient alternatives</p>
                              <p>• Seasonal ingredient recommendations</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="tracking">
                          <AccordionTrigger>Progress Tracking</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-sm text-neutral-600">
                              <p>• Daily food diary and habit tracking</p>
                              <p>• Weekly progress photos and measurements</p>
                              <p>• Energy level and mood monitoring</p>
                              <p>• Goal achievement milestones</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="support">
                          <AccordionTrigger>Expert Support</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-sm text-neutral-600">
                              <p>• Weekly check-ins with your nutritionist</p>
                              <p>• Q&A sessions and plan adjustments</p>
                              <p>• Community forum access</p>
                              <p>• Emergency nutrition guidance</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="nutritionist" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meet Your Nutritionist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Users className="h-8 w-8 text-primary/60" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold">
                            {plan.nutritionist?.profile?.firstName} {plan.nutritionist?.profile?.lastName}
                          </h3>
                          <p className="text-neutral-600 text-sm mb-2">Certified Nutritionist</p>
                          <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1" />
                              <span>5+ years experience</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>500+ clients helped</span>
                            </div>
                          </div>
                          <p className="text-sm text-neutral-700">
                            Specializes in sustainable weight management and women&apos;s health nutrition. 
                            Passionate about helping women develop a healthy relationship with food 
                            while achieving their wellness goals.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Client Reviews</span>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-5 w-5 fill-current mr-1" />
                          <span className="font-semibold">4.8</span>
                          <span className="text-neutral-500 ml-1">(127 reviews)</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        {
                          name: "Sarah M.",
                          rating: 5,
                          comment: "This plan completely changed my relationship with food. I lost 15 pounds and feel more energetic than ever!",
                          date: "2 weeks ago"
                        },
                        {
                          name: "Jessica L.",
                          rating: 5,
                          comment: "The meal plans are so easy to follow and the recipes are delicious. My family loves them too!",
                          date: "1 month ago"
                        },
                        {
                          name: "Maria R.",
                          rating: 4,
                          comment: "Great support from the nutritionist. The weekly check-ins really kept me motivated.",
                          date: "2 months ago"
                        }
                      ].map((review, index) => (
                        <div key={index} className="border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-primary">
                                  {review.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-sm">{review.name}</div>
                                <div className="flex items-center">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-neutral-500">{review.date}</span>
                          </div>
                          <p className="text-sm text-neutral-700">{review.comment}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="sticky top-8"
            >
              <Card className="border-2 border-primary/20">
                <CardHeader className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatPrice(plan.price)}
                  </div>
                  <p className="text-neutral-600">One-time payment</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-primary mr-2" />
                      <span>{plan.durationDays} days of nutrition guidance</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MessageCircle className="h-4 w-4 text-primary mr-2" />
                      <span>Direct nutritionist support</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Shield className="h-4 w-4 text-primary mr-2" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                    >
                      {isPurchasing ? 'Processing...' : 'Start Your Journey'}
                    </Button>
                    
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/contact">
                        Ask Questions
                      </Link>
                    </Button>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center text-sm text-neutral-600">
                      <Shield className="h-4 w-4 mr-1" />
                      <span>Secure payment & data protection</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Why Choose This Plan?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Scientifically-backed nutrition strategies</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Sustainable lifestyle changes</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Personalized to your goals</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Expert guidance throughout</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}