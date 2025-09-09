// src/app/(marketing)/nutrition/loading.tsx
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function NutritionLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Hero Section Skeleton */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mx-auto mb-6" />
            <Skeleton className="h-16 w-full max-w-2xl mx-auto mb-6" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto mb-8" />
            
            {/* Stats Skeleton */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section Skeleton */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Skeleton */}
      <section className="py-8 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Skeleton className="h-10 w-full md:w-96" />
            <div className="flex gap-2">
              {Array(4).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-10 w-24" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          </div>

          {/* Plans Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="p-0">
                  <Skeleton className="h-48 w-full" />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-10 w-80 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-8 bg-white/20" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Skeleton className="h-12 w-40 bg-white/20" />
              <Skeleton className="h-12 w-48 bg-white/20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}