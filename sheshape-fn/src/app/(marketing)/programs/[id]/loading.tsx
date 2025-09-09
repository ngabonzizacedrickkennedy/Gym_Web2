// src/app/(marketing)/programs/[id]/loading.tsx
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProgramDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Button variant="ghost" disabled className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Programs
        </Button>
      </div>

      {/* Hero Section Skeleton */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Program Image Skeleton */}
            <div className="relative">
              <Skeleton className="aspect-video rounded-2xl w-full" />
              
              {/* Quick Stats Skeleton */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {Array(3).fill(0).map((_, index) => (
                  <Card key={index} className="p-4">
                    <Skeleton className="h-6 w-6 mx-auto mb-2" />
                    <Skeleton className="h-5 w-12 mx-auto mb-1" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </Card>
                ))}
              </div>
            </div>

            {/* Program Info Skeleton */}
            <div className="space-y-6">
              {/* Title and Badges */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-3/4" />
              </div>

              {/* Trainer Info Skeleton */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price and Actions Skeleton */}
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Skeleton className="h-10 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full mb-4" />
                  <Skeleton className="h-4 w-48 mx-auto" />
                </CardContent>
              </Card>

              {/* What's Included Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array(7).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-3 rounded-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Information Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs Skeleton */}
          <div className="w-full mb-8">
            <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-lg">
              {Array(3).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-10" />
              ))}
            </div>
          </div>

          {/* Tab Content Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div>
                <Skeleton className="h-5 w-40 mb-3" />
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="flex items-start">
                      <Skeleton className="h-4 w-4 mr-2 mt-0.5 rounded-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Skeleton className="h-5 w-32 mb-3" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Array(4).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center p-3 bg-neutral-50 rounded-lg">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Related Programs Skeleton */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>

          <div className="text-center py-12">
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
        </div>
      </section>
    </div>
  );
}