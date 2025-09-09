// src/app/(marketing)/trainers/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Star, 
  Users, 
  BookOpen, 
  Award,
  Calendar,
  Mail,
  Phone,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { trainerService } from '@/services/trainerService';
import { GymProgram } from '@/types/models';
import { User } from '@/types/user';
import { toast } from 'react-toastify';
import { formatDate, getInitials } from '@/lib/utils';

export default function TrainerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trainer, setTrainer] = useState<User | null>(null);
  const [programs, setPrograms] = useState<GymProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const trainerId = Number(params.id);

  // Mock stats - in real app this would come from API
  const mockStats = {
    totalPrograms: programs.length,
    totalStudents: 150,
    completionRate: 92,
    rating: 4.8,
    totalReviews: 24,
    yearsExperience: 5
  };

  const mockCertifications = [
    'NASM Certified Personal Trainer',
    'ACSM Exercise Physiologist',
    'Yoga Alliance RYT-200',
    'Precision Nutrition Level 1'
  ];

  const mockSpecializations = [
    'Strength Training',
    'Weight Loss',
    'HIIT',
    'Functional Movement'
  ];

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        setIsLoading(true);
        const [trainerData, programsData] = await Promise.all([
          trainerService.getTrainerById(trainerId),
          trainerService.getTrainerPrograms(trainerId)
        ]);
        
        setTrainer(trainerData);
        setPrograms(programsData);
      } catch (err) {
        console.error('Error fetching trainer:', err);
        setError('Failed to load trainer details');
        toast.error('Failed to load trainer details');
      } finally {
        setIsLoading(false);
      }
    };

    if (trainerId) {
      fetchTrainerData();
    }
  }, [trainerId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card>
          <CardContent className="p-12">
            <h2 className="text-2xl font-bold mb-4">Trainer Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The trainer you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = trainer.profile?.firstName && trainer.profile?.lastName 
    ? `${trainer.profile.firstName} ${trainer.profile.lastName}`
    : trainer.username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Trainers
        </Button>

        {/* Trainer Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                <AvatarImage 
                  src={trainer.profile?.profilePictureUrl} 
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                    <p className="text-muted-foreground mb-3">
                      {trainer.profile?.bio || 'Professional Fitness Trainer'}
                    </p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${
                              i < Math.floor(mockStats.rating) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-muted-foreground"
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{mockStats.rating}</span>
                      <span className="text-muted-foreground">
                        ({mockStats.totalReviews} reviews)
                      </span>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>{mockStats.totalPrograms} Programs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{mockStats.totalStudents} Students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-primary" />
                        <span>{mockStats.yearsExperience} Years Experience</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button size="lg" asChild>
                      <Link href={`/trainers/${trainer.id}/contact`}>
                        Contact Trainer
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href={`#programs`}>
                        View Programs
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold">{mockStats.totalPrograms}</div>
              <p className="text-sm text-muted-foreground">Programs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold">{mockStats.totalStudents}</div>
              <p className="text-sm text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold">{mockStats.completionRate}%</div>
              <p className="text-sm text-muted-foreground">Completion</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold">{mockStats.rating}</div>
              <p className="text-sm text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="programs">Programs ({programs.length})</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>About {displayName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {trainer.profile?.bio || 
                        `${displayName} is a dedicated fitness professional with ${mockStats.yearsExperience} years of experience helping clients achieve their health and fitness goals. With a passion for transforming lives through fitness, they specialize in creating personalized workout programs that deliver real results.`
                      }
                    </p>
                  </CardContent>
                </Card>

                {/* Specializations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Specializations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mockSpecializations.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{trainer.email}</span>
                    </div>
                    {trainer.profile?.phoneNumber && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{trainer.profile.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Member since {formatDate(trainer.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" asChild>
                      <Link href={`/trainers/${trainer.id}/contact`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/trainers/${trainer.id}/schedule`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Session
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6" id="programs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Training Programs</h3>
                <p className="text-muted-foreground">
                  Explore {displayName}&apos;s fitness programs designed to help you reach your goals
                </p>
              </div>
            </div>

            {programs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Programs Available</h3>
                  <p className="text-muted-foreground">
                    This trainer hasn&apos;t published any programs yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                  <ProgramCard 
                    key={program.id} 
                    program={program}
                    trainerName={displayName}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockCertifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="font-medium">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Experience & Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Professional Experience</h4>
                      <p className="text-sm text-muted-foreground">
                        {mockStats.yearsExperience} years of experience in personal training and fitness coaching
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Success Rate</h4>
                      <p className="text-sm text-muted-foreground">
                        {mockStats.completionRate}% client completion rate with consistently positive results
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Reviews</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${
                            i < Math.floor(mockStats.rating) 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-muted-foreground"
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-xl font-bold">{mockStats.rating}</span>
                    <span className="text-muted-foreground">
                      based on {mockStats.totalReviews} reviews
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Reviews feature coming soon. Contact the trainer directly for references.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}