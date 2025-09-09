// src/hooks/usePrograms.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GymProgram, ProgramFilters, PaginatedPrograms } from '@/types/models';
import { programService } from '@/services/programService';
import { toast } from 'react-toastify';

// Custom hook for managing programs data
export function usePrograms(filters: ProgramFilters = {}) {
//   const queryClient = useQueryClient();

  const {
    data: programsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['programs', filters],
    queryFn: (): Promise<PaginatedPrograms> => programService.getPrograms(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
  });

  return {
    programs: programsData?.programs || [],
    totalCount: programsData?.totalCount || 0,
    currentPage: programsData?.currentPage || 1,
    totalPages: programsData?.totalPages || 1,
    hasMore: programsData?.hasMore || false,
    isLoading,
    error,
    refetch
  };
}

// Hook for getting a single program
export function useProgram(programId: number) {
  return useQuery({
    queryKey: ['program', programId],
    queryFn: (): Promise<GymProgram> => programService.getProgramById(programId),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for program enrollment
export function useProgramEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: number) => programService.purchaseProgram(programId),
    onSuccess: (data, programId) => {
      toast.success('Successfully enrolled in program!');
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      queryClient.invalidateQueries({ queryKey: ['user-programs'] });
    },
    onError: (error) => {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll in program. Please try again.');
    }
  });
}

// Hook for featured programs
export function useFeaturedPrograms() {
  return useQuery({
    queryKey: ['programs', 'featured'],
    queryFn: (): Promise<GymProgram[]> => programService.getFeaturedPrograms(),
    staleTime: 10 * 60 * 1000, // 10 minutes for featured content
    gcTime: 15 * 60 * 1000, // 15 minutes for featured content
  });
}

// Hook for program sessions
export function useProgramSessions(programId: number) {
  return useQuery({
    queryKey: ['program-sessions', programId],
    queryFn: () => programService.getProgramSessions(programId),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}