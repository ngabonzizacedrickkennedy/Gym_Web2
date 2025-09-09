// src/app/(marketing)/programs/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  Calendar,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle,
  Target,
  Award,
  ArrowLeft,
  Heart,
  Share2,
  AlertCircle
} from 'lucide-react';
import { GymProgram, GymSession } from '@/types/models';
import { programService } from '@/services/programService';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-toastify';

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const programId = parseInt(params.id as string);

  const [program, setProgram] = useState<GymProgram | null>(null);
  const [sessions, setSessions] = useState<GymSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadProgramData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [programData, sessionsData] = await Promise.all([
          programService.getProgramById(programId),
          programService.getProgramSessions(programId)
        ]);

        setProgram(programData);
        setSessions(sessionsData);
      } catch (err) {
        console.error('Error loading program:', err);
        setError('Failed to load program details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (programId) {
      loadProgramData();
    }
  }, [programId]);

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDurationLabel = (days: number) => {
    if (days <= 7) return `${days} day${days > 1 ? 's' : ''}`;
    if (days <= 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.info('Please log in to enroll in this program');
      router.push('/login');
      return;
    }

    try {
      setIsEnrolling(true);
      await programService.purchaseProgram(programId);
      toast.success('Successfully enrolled in program!');
      router.push('/dashboard/my-programs');
    } catch (err) {
      console.error('Error enrolling in program:', err);
      toast.error('Failed to enroll in program. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: program?.title,
          text: program?.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
        console.log(err)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Program not found'}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={() => router.push('/programs')}
            >
              Back to Programs
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Programs
        </Button>
      </div>

      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Program Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                {program.imageUrl && !imageError ? (
                  <Image
                    src={program.imageUrl}
                    alt={program.title}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Play className="h-20 w-20 text-primary/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors cursor-pointer">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="font-semibold">{getDurationLabel(program.durationDays)}</div>
                  <div className="text-sm text-neutral-600">Duration</div>
                </div>
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <Play className="h-6 w-6 text-secondary mx-auto mb-2" />
                  <div className="font-semibold">{sessions.length}</div>
                  <div className="text-sm text-neutral-600">Sessions</div>
                </div>
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <Users className="h-6 w-6 text-accent1 mx-auto mb-2" />
                  <div className="font-semibold">{program.enrolledCount || 0}</div>
                  <div className="text-sm text-neutral-600">Enrolled</div>
                </div>
              </div>
            </motion.div>

            {/* Program Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Title and Badges */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getDifficultyColor(program.difficultyLevel)}>
                    {program.difficultyLevel}
                  </Badge>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm ml-1">4.8 (127 reviews)</span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                  {program.title}
                </h1>

                <p className="text-lg text-neutral-600 leading-relaxed">
                  {program.description}
                </p>
              </div>

              {/* Trainer Info */}
              {program.trainer && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={program.trainer.profile?.profilePictureUrl} 
                          alt={`${program.trainer.profile?.firstName} ${program.trainer.profile?.lastName}`}
                        />
                        <AvatarFallback className="text-lg">
                          {program.trainer.profile?.firstName?.[0]}{program.trainer.profile?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {program.trainer.profile?.firstName} {program.trainer.profile?.lastName}
                        </h3>
                        <p className="text-neutral-600">Certified Personal Trainer</p>
                        <div className="flex items-center mt-2">
                          <Award className="h-4 w-4 text-primary mr-1" />
                          <span className="text-sm text-neutral-600">5+ years experience</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Price and Actions */}
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        {formatPrice(program.price)}
                      </div>
                      <div className="text-sm text-neutral-600">
                        One-time payment • Lifetime access
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full mb-4"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Enrolling...
                      </>
                    ) : (
                      'Enroll Now'
                    )}
                  </Button>

                  <div className="flex items-center justify-center text-sm text-neutral-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    30-day money-back guarantee
                  </div>
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    What&apos;s Included
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    `${sessions.length} video workout sessions`,
                    'Detailed exercise instructions',
                    'Progress tracking tools',
                    'Nutritional guidance',
                    'Community support access',
                    'Mobile app access',
                    'Lifetime updates'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Information */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Program Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">About This Program</h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {program.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Who This Program Is For</h3>
                      <ul className="space-y-2 text-neutral-600">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          Women looking to {program.difficultyLevel.toLowerCase() === 'beginner' ? 'start their fitness journey' : 'advance their training'}
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          Those who prefer structured, guided workouts
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          People with {program.durationDays <= 30 ? 'limited time' : 'commitment to long-term results'}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Equipment Needed</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['Dumbbells', 'Resistance Bands', 'Yoga Mat', 'Water Bottle'].map((equipment) => (
                          <div key={equipment} className="flex items-center p-3 bg-neutral-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm">{equipment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Program Sessions ({sessions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sessions.map((session, index) => (
                        <div key={session.id} className="flex items-start p-4 border rounded-lg hover:bg-neutral-50 transition-colors">
                          <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                            <span className="text-primary font-semibold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{session.title}</h4>
                            <p className="text-sm text-neutral-600 mb-2">
                              {session.description}
                            </p>
                            <div className="flex items-center text-xs text-neutral-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {session.durationMinutes} minutes
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Reviews Coming Soon</h3>
                      <p className="text-neutral-600">
                        Be the first to enroll and leave a review for this program!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related Programs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              You Might Also Like
            </h2>
            <p className="text-neutral-600">
              Discover more programs from the same trainer
            </p>
          </motion.div>

          {/* This would typically load related programs */}
          <div className="text-center py-12">
            <Button variant="outline" onClick={() => router.push('/programs')}>
              Browse All Programs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}