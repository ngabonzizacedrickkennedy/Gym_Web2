// src/components/marketing/TrainersShowcase.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Users, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TrainerCard } from '@/components/trainers/trainerCard';
import { trainerService } from '@/services/trainerService';
import { User } from '@/types/user';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

interface TrainersShowcaseProps {
  title?: string;
  subtitle?: string;
  maxTrainers?: number;
  showViewAllButton?: boolean;
  className?: string;
}

export function TrainersShowcase({ 
  title = "Meet Our Expert Trainers",
  subtitle = "Get personalized guidance from certified fitness professionals",
  maxTrainers = 3,
  showViewAllButton = true,
  className 
}: TrainersShowcaseProps) {
  const [trainers, setTrainers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock stats for demonstration
  const [trainerStats] = useState(new Map([
    [1, { programCount: 5, studentCount: 120, rating: 4.8 }],
    [2, { programCount: 3, studentCount: 85, rating: 4.6 }],
    [3, { programCount: 7, studentCount: 200, rating: 4.9 }],
    [4, { programCount: 4, studentCount: 95, rating: 4.7 }],
    [5, { programCount: 6, studentCount: 150, rating: 4.8 }],
  ]));

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setIsLoading(true);
        const data = await trainerService.getAllTrainers();
        // Limit to maxTrainers for showcase
        setTrainers(data.slice(0, maxTrainers + 2)); // Get a few extra for carousel
      } catch (error) {
        console.error('Error fetching trainers:', error);
        toast.error('Failed to load trainers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainers();
  }, [maxTrainers]);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev >= trainers.length - maxTrainers ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev <= 0 ? Math.max(0, trainers.length - maxTrainers) : prev - 1
    );
  };

  const visibleTrainers = trainers.slice(currentIndex, currentIndex + maxTrainers);

  if (isLoading) {
    return (
      <section className={cn("py-16", className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-xl text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (trainers.length === 0) {
    return (
      <section className={cn("py-16", className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-xl text-muted-foreground">{subtitle}</p>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No trainers available at the moment. Check back soon!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-16 bg-gradient-to-br from-background to-muted/20", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{trainers.length}+</div>
              <p className="text-muted-foreground">Certified Trainers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">
                {Array.from(trainerStats.values()).reduce((sum, stats) => sum + stats.programCount, 0)}+
              </div>
              <p className="text-muted-foreground">Training Programs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">4.8</div>
              <p className="text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Trainers Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {trainers.length > maxTrainers && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 rounded-full h-10 w-10 p-0"
                onClick={prevSlide}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 rounded-full h-10 w-10 p-0"
                onClick={nextSlide}
                disabled={currentIndex >= trainers.length - maxTrainers}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Trainers Grid */}
          <div className="px-8">
            <div className={cn(
              "grid gap-6 transition-all duration-300",
              maxTrainers === 1 ? "grid-cols-1" :
              maxTrainers === 2 ? "grid-cols-1 md:grid-cols-2" :
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}>
              {visibleTrainers.map((trainer) => {
                const stats = trainerStats.get(trainer.id) || { 
                  programCount: 0, 
                  studentCount: 0, 
                  rating: 0 
                };
                return (
                  <TrainerCard
                    key={trainer.id}
                    trainer={trainer}
                    programCount={stats.programCount}
                    studentCount={stats.studentCount}
                    rating={stats.rating}
                  />
                );
              })}
            </div>
          </div>

          {/* Carousel Indicators */}
          {trainers.length > maxTrainers && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(trainers.length / maxTrainers) }).map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    Math.floor(currentIndex / maxTrainers) === index
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30"
                  )}
                  onClick={() => setCurrentIndex(index * maxTrainers)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        {showViewAllButton && (
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/trainers">
                View All Trainers
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}