'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgramList } from '@/components/programs/programList';
import { ProgramFilters } from '@/components/programs/programFilters';
import { Dumbbell, Users, Award, Target, Clock, TrendingUp } from 'lucide-react';
import type { ProgramFilters as ProgramFiltersType } from '@/types/models';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';


export default function ProgramsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ProgramFiltersType>({
    page: 1,
    limit: 12,
    sort: 'newest'
  });

  const handleFiltersChange = useCallback((newFilters: ProgramFiltersType) => {
    setFilters(prev => {
      // Only update if something actually changed
      if (JSON.stringify(prev) === JSON.stringify(newFilters)) {
        return prev;
      }
      return newFilters;
    });
  }, []);

  const handleEnroll = useCallback((programId: number) => {
    if (!user) {
      toast.info('Please log in to enroll in programs');
      window.location.href = '/login';
      return;
    }
    
    window.location.href = `/programs/${programId}`;
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-accent1 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 mb-6">
              <Dumbbell className="h-3 w-3 mr-1" />
              Expert-Led Fitness Programs
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
              Transform Your Body with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Expert Programs
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Discover scientifically-designed fitness programs created by certified trainers. 
              Whether you&apos;re a beginner or advanced athlete, find the perfect program to reach your goals.
            </p>

            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">200+</div>
                <div className="text-sm text-neutral-600">Programs Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-secondary">50K+</div>
                <div className="text-sm text-neutral-600">Women Transformed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-accent1">4.9</div>
                <div className="text-sm text-neutral-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600">98%</div>
                <div className="text-sm text-neutral-600">Success Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Target className="h-8 w-8 text-primary" />,
                title: "Goal-Oriented",
                description: "Programs designed for specific fitness goals and outcomes"
              },
              {
                icon: <Users className="h-8 w-8 text-secondary" />,
                title: "Expert Trainers",
                description: "Created by certified trainers with years of experience"
              },
              {
                icon: <Clock className="h-8 w-8 text-accent1" />,
                title: "Flexible Scheduling",
                description: "Work out on your schedule with programs that fit your lifestyle"
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-green-600" />,
                title: "Track Progress",
                description: "Monitor your improvements with detailed progress tracking"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 mb-4 inline-flex">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-neutral-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Choose Your Perfect Program
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              From beginner-friendly routines to advanced challenges, find the program 
              that matches your fitness level and goals.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <ProgramFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </motion.div>

          {/* Programs List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ProgramList
              filters={filters}
              onEnroll={handleEnroll}
              showLoadMore={true}
              itemsPerPage={12}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Award className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Transformation?
            </h2>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of women who have transformed their bodies and lives with our 
              expert-designed fitness programs. Your journey starts today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-primary font-semibold">
                Browse All Programs
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
              >
                Talk to a Trainer
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}