// src/app/(marketing)/trainers/[id]/programs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { trainerService } from '@/services/trainerService';
import { GymProgram } from '@/types/models';
import { User } from '@/types/user';
import { toast } from 'react-toastify';
import { getInitials, formatPrice } from '@/lib/utils';

export default function TrainerProgramsPage() {
  const params = useParams();
  const router = useRouter();
  const [trainer, setTrainer] = useState<User | null>(null);
  const [programs, setPrograms] = useState<GymProgram[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<GymProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'difficulty' | 'duration'>('name');
  
  const trainerId = Number(params.id);

  const difficultyLevels = ['All Levels', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [trainerData, programsData] = await Promise.all([
          trainerService.getTrainerById(trainerId),
          trainerService.getTrainerPrograms(trainerId)
        ]);
        
        setTrainer(trainerData);
        setPrograms(programsData);
        setFilteredPrograms(programsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load trainer programs');
      } finally {
        setIsLoading(false);
      }
    };

    if (trainerId) {
      fetchData();
    }
  }, [trainerId]);

  // Filter and sort programs
  useEffect(() => {
    let filtered = [...programs];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(program =>
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply difficulty filter
    if (difficultyFilter && difficultyFilter !== 'All Levels') {
      filtered = filtered.filter(program => program.difficultyLevel === difficultyFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'price':
          return a.price - b.price;
        case 'difficulty':
          const difficultyOrder = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3, EXPERT: 4 };
          return difficultyOrder[a.difficultyLevel as keyof typeof difficultyOrder] - 
                 difficultyOrder[b.difficultyLevel as keyof typeof difficultyOrder];
        case 'duration':
          return a.durationDays - b.durationDays;
        default:
          return 0;
      }
    });

    setFilteredPrograms(filtered);
  }, [programs, searchQuery, difficultyFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card>
          <CardContent className="p-12">
            <h2 className="text-2xl font-bold mb-4">Trainer Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The trainer you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button onClick={() => router.push('/trainers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trainers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = trainer.profile?.firstName && trainer.profile?.lastName 
    ? `${trainer.profile.firstName} ${trainer.profile.lastName}`
    : trainer.username;

  const programStats = {
    totalPrograms: programs.length,
    avgPrice: programs.length > 0 ? programs.reduce((sum, p) => sum + p.price, 0) / programs.length : 0,
    avgDuration: programs.length > 0 ? programs.reduce((sum, p) => sum + p.durationDays, 0) / programs.length : 0,
    totalEnrolled: programs.reduce((sum, p) => sum + (p.enrolledCount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            <Link href="/trainers" className="hover:text-primary">Trainers</Link>
            {' / '}
            <Link href={`/trainers/${trainerId}`} className="hover:text-primary">{displayName}</Link>
            {' / '}
            <span>Programs</span>
          </div>
        </div>

        {/* Trainer Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={trainer.profile?.profilePictureUrl} 
                  alt={displayName}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{displayName}&apos;s Programs</h1>
                <p className="text-muted-foreground">
                  Explore personalized fitness programs designed to help you achieve your goals
                </p>
              </div>

              <Button asChild>
                <Link href={`/trainers/${trainerId}`}>
                  View Trainer Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{programStats.totalPrograms}</div>
              <p className="text-sm text-muted-foreground">Total Programs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(programStats.avgPrice)}
              </div>
              <p className="text-sm text-muted-foreground">Average Price</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(programStats.avgDuration)}
              </div>
              <p className="text-sm text-muted-foreground">Average Days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{programStats.totalEnrolled}</div>
              <p className="text-sm text-muted-foreground">Total Enrolled</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Difficulty Filter */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="difficulty">Sort by Difficulty</SelectItem>
                  <SelectItem value="duration">Sort by Duration</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center">
                <span className="text-sm text-muted-foreground">
                  {filteredPrograms.length} of {programs.length} programs
                </span>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
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
              {difficultyFilter && difficultyFilter !== 'All Levels' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {difficultyFilter}
                  <button 
                    onClick={() => setDifficultyFilter('')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground mb-4">
                {programs.length === 0 ? (
                  <>
                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Programs Available</h3>
                    <p>This trainer hasn&apos;t published any programs yet.</p>
                  </>
                ) : (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Programs Found</h3>
                    <p>Try adjusting your search criteria or browse all programs.</p>
                  </>
                )}
              </div>
              {programs.length === 0 && (
                <Button asChild>
                  <Link href={`/trainers/${trainerId}`}>
                    Contact Trainer
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <ProgramCard 
                key={program.id} 
                program={program}
                trainerName={displayName}
                showTrainer={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}