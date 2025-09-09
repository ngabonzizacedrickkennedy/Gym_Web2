// src/services/programService.ts
import { api } from '@/lib/api';
import { GymProgram, PaginatedPrograms, ProgramFilters, GymSession, UserGymProgram } from '@/types/models';

// Define purchase response type
interface ProgramPurchaseResponse {
  id: number;
  userId: number;
  programId: number;
  purchaseDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  message?: string;
}

export const programService = {
  // Get all active programs with pagination and filters
  async getPrograms(filters: ProgramFilters = {}): Promise<PaginatedPrograms> {
    const params = new URLSearchParams();
    
    // Add filter parameters
    if (filters.difficultyLevel) params.append('difficultyLevel', filters.difficultyLevel);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.maxDuration !== undefined) params.append('maxDuration', filters.maxDuration.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.trainerId !== undefined) params.append('trainerId', filters.trainerId.toString());
    
    // Add pagination parameters
    if (filters.page !== undefined) params.append('page', (filters.page - 1).toString());
    if (filters.limit !== undefined) params.append('size', filters.limit.toString());
    
    // Add sorting
    if (filters.sort) {
      let field = 'createdAt';
      let direction = 'desc';
      
      switch (filters.sort) {
        case 'price_asc':
          field = 'price';
          direction = 'asc';
          break;
        case 'price_desc':
          field = 'price';
          direction = 'desc';
          break;
        case 'duration_asc':
          field = 'durationDays';
          direction = 'asc';
          break;
        case 'duration_desc':
          field = 'durationDays';
          direction = 'desc';
          break;
        case 'newest':
          field = 'createdAt';
          direction = 'desc';
          break;
        case 'popular':
          field = 'popularity';
          direction = 'desc';
          break;
      }
      
      params.append('sort', `${field},${direction}`);
    }
    
    // Use the correct endpoint that matches your backend
    const queryString = params.toString();
    const url = queryString ? `/api/gym/programs?${queryString}` : '/api/gym/programs';
    
    const response = await api.get<GymProgram[]>(url);
    
    // Your backend returns a simple array, not paginated response
    // So we need to handle pagination client-side or modify backend
    const programs = Array.isArray(response.data) ? response.data : [];
    
    // Simple client-side pagination simulation
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPrograms = programs.slice(startIndex, endIndex);
    
    return {
      programs: paginatedPrograms,
      totalCount: programs.length,
      currentPage: page,
      totalPages: Math.ceil(programs.length / limit),
      hasMore: endIndex < programs.length,
    };
  },
  
  // Get a single program by ID
  async getProgramById(id: number): Promise<GymProgram> {
    const response = await api.get<GymProgram>(`/api/gym/programs/${id}`);
    return response.data;
  },
  
  // Get program sessions
  async getProgramSessions(programId: number): Promise<GymSession[]> {
    const response = await api.get<GymSession[]>(`/api/gym/programs/${programId}/sessions`);
    return response.data;
  },
  
  // Purchase/enroll in a program (uses current user endpoint)
  async purchaseProgram(programId: number): Promise<ProgramPurchaseResponse> {
    const response = await api.post<ProgramPurchaseResponse>(`/api/gym/programs/${programId}/purchase`);
    return response.data;
  },
  
  // Get programs by trainer
  async getProgramsByTrainer(trainerId: number): Promise<GymProgram[]> {
    const response = await api.get<GymProgram[]>(`/api/gym/trainer/${trainerId}/programs`);
    return response.data;
  },
  
  // Get featured programs (limit to 6 most popular)
  async getFeaturedPrograms(): Promise<GymProgram[]> {
    const response = await api.get<GymProgram[]>('/api/gym/programs');
    const programs = Array.isArray(response.data) ? response.data : [];
    
    // Return first 6 programs as "featured" for now
    // You might want to add a backend endpoint for this later
    return programs.slice(0, 6);
  },

  // Get user's enrolled programs (uses current user endpoint)
  async getUserPrograms(): Promise<UserGymProgram[]> {
    const response = await api.get<UserGymProgram[]>('/api/gym/my-programs');
    return response.data;
  },

  // Update user program progress (uses current user endpoint)
  async updateProgramProgress(programId: number, sessionId: number): Promise<UserGymProgram> {
    const response = await api.put<UserGymProgram>(
      `/api/gym/programs/${programId}/last-watched?sessionId=${sessionId}`
    );
    return response.data;
  }
};