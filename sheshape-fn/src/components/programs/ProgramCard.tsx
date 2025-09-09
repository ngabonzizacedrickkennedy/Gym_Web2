// src/components/programs/ProgramCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Users, 
  Star, 
  TrendingUp,
  Play,
  Target,
  DollarSign,
  ChevronRight,
  Dumbbell,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GymProgram } from '@/types/models';
import { cn, formatPrice, getInitials } from '@/lib/utils';

interface ProgramCardProps {
  program: GymProgram;
  trainerName?: string;
  trainerImage?: string;
  showTrainer?: boolean;
  compact?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  onEnroll?: (programId: number) => void;
  className?: string;
}

export function ProgramCard({ 
  program, 
  trainerName,
  trainerImage,
  showTrainer = true,
  compact = false,
  variant = 'default',
  onEnroll,
  className 
}: ProgramCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case 'BEGINNER':
        return <Target className="h-3 w-3" />;
      case 'INTERMEDIATE':
        return <TrendingUp className="h-3 w-3" />;
      case 'ADVANCED':
        return <Star className="h-3 w-3" />;
      default:
        return <Target className="h-3 w-3" />;
    }
  };

  const getDurationLabel = (days: number) => {
    if (days <= 7) return `${days} day${days > 1 ? 's' : ''}`;
    if (days <= 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
  };

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEnroll) {
      onEnroll(program.id);
    }
  };

  // Use the trainer info from the program object
  const displayTrainerName = trainerName || 
    (program.trainer?.profile?.firstName && program.trainer?.profile?.lastName 
      ? `${program.trainer.profile.firstName} ${program.trainer.profile.lastName}`
      : program.trainer?.username);
  
  const displayTrainerImage = trainerImage || program.trainer?.profile?.profilePictureUrl;

  if (compact || variant === 'compact') {
    return (
      <Card className={cn("group hover:shadow-lg transition-all duration-300", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-primary" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate mb-1">{program.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs px-1 py-0", getDifficultyColor(program.difficultyLevel))}
                >
                  {getDifficultyIcon(program.difficultyLevel)}
                  <span className="ml-1">{program.difficultyLevel}</span>
                </Badge>
                <span>•</span>
                <span>{program.durationDays} days</span>
                <span>•</span>
                <span>{formatPrice(program.price)}</span>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/programs/${program.id}`}>
                View
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cardContent = (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-xl border-0 overflow-hidden",
        variant === 'featured' && "ring-2 ring-primary/20",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Program Image */}
      <CardHeader className="p-0 relative overflow-hidden">
        <div className={cn(
          "relative bg-gradient-to-br from-primary/10 to-secondary/10",
          variant === 'featured' ? 'h-64' : 'h-48'
        )}>
          {program.imageUrl && !imageError ? (
            <Image
              src={program.imageUrl}
              alt={program.title}
              fill
              className={`object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Dumbbell className={`${
                variant === 'featured' ? 'h-20 w-20' : 'h-16 w-16'
              } text-primary/40`} />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Difficulty Badge */}
          <Badge 
            className={cn("absolute top-3 left-3", getDifficultyColor(program.difficultyLevel))}
          >
            {getDifficultyIcon(program.difficultyLevel)}
            <span className="ml-1">{program.difficultyLevel}</span>
          </Badge>

          {/* Featured Badge */}
          {variant === 'featured' && (
            <Badge className="absolute top-3 right-3 bg-primary text-white">
              Popular
            </Badge>
          )}

          {/* Price badge */}
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-background/90 text-foreground border">
              <DollarSign className="h-3 w-3 mr-1" />
              {formatPrice(program.price)}
            </Badge>
          </div>

          {/* Play Icon on Hover */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white/90 rounded-full p-3">
                <Play className="h-6 w-6 text-primary" />
              </div>
            </motion.div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex-grow">
          {/* Title */}
          <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {program.title}
          </h3>
          
          {/* Description */}
          {program.description && (
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {program.description}
            </p>
          )}

          {/* Program Stats */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              {getDurationLabel(program.durationDays)}
            </div>
            
            {program.totalSessions && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Play className="h-4 w-4 mr-2 text-primary" />
                {program.totalSessions} sessions
              </div>
            )}
            
            {program.enrolledCount && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2 text-primary" />
                {program.enrolledCount.toLocaleString()} enrolled
              </div>
            )}
          </div>

          {/* Trainer Info */}
          {showTrainer && displayTrainerName && (
            <div className="flex items-center mb-4 pt-3 border-t border-border/50">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage 
                  src={displayTrainerImage} 
                  alt={displayTrainerName}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(displayTrainerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{displayTrainerName}</p>
                <p className="text-xs text-muted-foreground">Certified Trainer</p>
              </div>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm ml-1">4.8</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            className="flex-1 group-hover:border-primary/50 transition-colors"
            asChild
          >
            <Link href={`/programs/${program.id}`}>
              View Details
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          
          {onEnroll ? (
            <Button 
              className="flex-1 group-hover:bg-primary/90 transition-colors" 
              onClick={handleEnrollClick}
              disabled={!program.isActive}
            >
              {program.isActive ? 'Enroll Now' : 'Unavailable'}
            </Button>
          ) : (
            <Button 
              className="flex-1" 
              asChild 
              disabled={!program.isActive}
            >
              <Link href={`/programs/${program.id}/enroll`}>
                {program.isActive ? 'Enroll Now' : 'Unavailable'}
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Link href={`/programs/${program.id}`} className="block h-full">
        {cardContent}
      </Link>
    </motion.div>
  );
}