// src/services/trainerService.ts
import { api } from '@/lib/api';
import { User } from '@/types/user';

export interface TrainerStats {
  totalPrograms: number;
  totalStudents: number;
  yearsExperience?: number;
  rating?: number;
}

// Use the existing GymProgram interface from models.ts
import { GymProgram } from '@/types/models';

export interface TrainerDetails extends User {
  stats?: TrainerStats;
  programs?: GymProgram[];
}

export const trainerService = {
  // Get all public trainers
  async getAllTrainers(): Promise<User[]> {
    const response = await api.get<User[]>('/api/trainers');
    return response.data;
  },

  // Get trainer by ID
  async getTrainerById(trainerId: number): Promise<User> {
    const response = await api.get<User>(`/api/users/${trainerId}`);
    return response.data;
  },

  // Get programs by trainer
  async getTrainerPrograms(trainerId: number): Promise<GymProgram[]> {
    const response = await api.get<GymProgram[]>(`/api/gym/trainer/${trainerId}/programs`);
    return response.data;
  },

  // Get trainer with detailed information (programs + stats)
  async getTrainerDetails(trainerId: number): Promise<TrainerDetails> {
    const [trainer, programs] = await Promise.all([
      this.getTrainerById(trainerId),
      this.getTrainerPrograms(trainerId)
    ]);

    // Calculate stats from programs
    const stats: TrainerStats = {
      totalPrograms: programs.length,
      totalStudents: programs.reduce((sum, program) => sum + (program.enrolledCount || 0), 0),
      rating: 4.5, // This would come from reviews in a real app
    };

    return {
      ...trainer,
      stats,
      programs
    };
  }
};