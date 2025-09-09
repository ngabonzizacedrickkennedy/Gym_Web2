// src/app/(marketing)/trainers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { Search, Filter, Grid, List, Star, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TrainerCard } from '@/components/trainers/trainerCard';
import { trainerService } from '@/services/trainerService';
import { User } from '@/types/user';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

export default function TrainersPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <TrainersContent />
    </Suspense>
  );
}

function TrainersContent() {
  const [trainers, setTrainers] = useState<User[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'programs'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');

  // Mock data for demonstration - in real app this would come from API
  const [trainerStats] = useState(new Map([
    [1, { programCount: 5, studentCount: 120, rating: 4.8 }],
    [2, { programCount: 3, studentCount: 85, rating: 4.6 }],
    [3, { programCount: 7, studentCount: 200, rating: 4.9 }],
  ]));

  const specializations = [
    'All Specializations',
    'Strength Training',
    'Weight Loss',
    'HIIT',
    'Yoga',
    'Pilates',
    'Cardio',
    'Flexibility'
  ];

  // Fetch trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setIsLoading(true);
        const data = await trainerService.getAllTrainers();
        setTrainers(data);
        setFilteredTrainers(data);
      } catch (error) {
        console.error('Error fetching trainers:', error);
        toast.error('Failed to load trainers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  // Filter and search trainers
  useEffect(() => {
    let filtered = [...trainers];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(trainer => {
        const fullName = `${trainer.profile?.firstName || ''} ${trainer.profile?.lastName || ''}`.toLowerCase();
        const username = trainer.username.toLowerCase();
        const bio = trainer.profile?.bio?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || username.includes(query) || bio.includes(query);
      });
    }

    // Apply specialization filter
    if (selectedSpecialization && selectedSpecialization !== 'All Specializations') {
      // In a real app, this would filter based on actual specializations from the profile
      filtered = filtered.filter(() => Math.random() > 0.3); // Mock filter
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = `${a.profile?.firstName || ''} ${a.profile?.lastName || ''}`.trim() || a.username;
          const nameB = `${b.profile?.firstName || ''} ${b.profile?.lastName || ''}`.trim() || b.username;
          return nameA.localeCompare(nameB);
        case 'rating':
          const ratingA = trainerStats.get(a.id)?.rating || 0;
          const ratingB = trainerStats.get(b.id)?.rating || 0;
          return ratingB - ratingA;
        case 'programs':
          const programsA = trainerStats.get(a.id)?.programCount || 0;
          const programsB = trainerStats.get(b.id)?.programCount || 0;
          return programsB - programsA;
        default:
          return 0;
      }
    });

    setFilteredTrainers(filtered);
  }, [trainers, searchQuery, selectedSpecialization, sortBy, trainerStats]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12 py-20">
        <h1 className="text-4xl font-bold mb-4">Meet Our Expert Trainers</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Our certified fitness professionals are here to guide you on your fitness journey. 
          Find the perfect trainer for your goals and start transforming your life today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{trainers.length}</div>
            <p className="text-muted-foreground">Expert Trainers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {Array.from(trainerStats.values()).reduce((sum, stats) => sum + stats.programCount, 0)}
            </div>
            <p className="text-muted-foreground">Training Programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Specialization Filter */}
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value: 'name' | 'rating' | 'programs') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="rating">Sort by Rating</SelectItem>
                <SelectItem value="programs">Sort by Programs</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1"
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchQuery}
                <button 
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedSpecialization && selectedSpecialization !== 'All Specializations' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedSpecialization}
                <button 
                  onClick={() => setSelectedSpecialization('')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          Showing {filteredTrainers.length} of {trainers.length} trainers
        </p>
      </div>

      {/* Trainers Grid/List */}
      {filteredTrainers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trainers found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all trainers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredTrainers.map((trainer) => {
            const stats = trainerStats.get(trainer.id) || { programCount: 0, studentCount: 0, rating: 0 };
            return (
              <TrainerCard
                key={trainer.id}
                trainer={trainer}
                programCount={stats.programCount}
                studentCount={stats.studentCount}
                rating={stats.rating}
                compact={viewMode === 'list'}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}