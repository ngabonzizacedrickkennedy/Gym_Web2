// src/components/trainers/TrainerCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Users, 
  BookOpen, 
  ArrowRight
} from 'lucide-react';
import { User } from '@/types/user';
import { cn, getInitials } from '@/lib/utils';

interface TrainerCardProps {
  trainer: User;
  programCount?: number;
  studentCount?: number;
  rating?: number;
  compact?: boolean;
  className?: string;
}

export function TrainerCard({ 
  trainer, 
  programCount = 0,
  studentCount = 0,
  rating = 0,
  compact = false,
  className 
}: TrainerCardProps) {
  const [imageError, setImageError] = useState(false);
  console.log(imageError);
  
  const displayName = trainer.profile?.firstName && trainer.profile?.lastName 
    ? `${trainer.profile.firstName} ${trainer.profile.lastName}`
    : trainer.username;
  
  const profileImage = trainer.profile?.profilePictureUrl;
  const bio = trainer.profile?.bio;
  
  // Mock specializations - in real app this would come from profile
  const specializations = ['Strength Training', 'Weight Loss', 'HIIT'];
  
  if (compact) {
    return (
      <Card className={cn("group hover:shadow-lg transition-all duration-300", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={profileImage} 
                alt={displayName}
                onError={() => setImageError(true)}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{displayName}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{programCount} programs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{studentCount} students</span>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/trainers/${trainer.id}`}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "group hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-background to-muted/20",
      className
    )}>
      <CardContent className="p-0">
        {/* Header with avatar and basic info */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-background shadow-lg">
              <AvatarImage 
                src={profileImage} 
                alt={displayName}
                className="object-cover"
                onError={() => setImageError(true)}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                {displayName}
              </h3>
              
              {rating > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(rating) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {rating.toFixed(1)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{programCount} programs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{studentCount} students</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <div className="px-6 pb-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {bio}
            </p>
          </div>
        )}

        {/* Specializations */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {specializations.slice(0, 3).map((spec, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
              >
                {spec}
              </Badge>
            ))}
            {specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{specializations.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/trainers/${trainer.id}`}>
                View Profile
              </Link>
            </Button>
            
            <Button size="sm" asChild>
              <Link href={`/trainers/${trainer.id}/programs`}>
                View Programs
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}