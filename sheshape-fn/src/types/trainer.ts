// src/types/trainer.ts
import { User, UserProfile } from './user';
import { GymProgram } from './models';

export interface Trainer extends User {
  profile: UserProfile & {
    bio?: string;
    specializations?: string[];
    certifications?: string[];
    yearsExperience?: number;
  };
}

export interface TrainerStats {
  totalPrograms: number;
  totalStudents: number;
  completionRate?: number;
  rating?: number;
  totalReviews?: number;
}

export interface TrainerDetails extends Trainer {
  stats: TrainerStats;
  programs: GymProgram[];
}

export interface TrainerCard {
  id: number;
  username: string;
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
    bio?: string;
    specializations?: string[];
  };
  stats: {
    programCount: number;
    studentCount: number;
    rating?: number;
  };
}