// src/components/programs/ProgramList.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgramCard } from './ProgramCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { GymProgram, ProgramFilters } from '@/types/models';
import { programService } from '@/services/programService';
import { toast } from 'react-toastify';

interface ProgramListProps {
  filters?: ProgramFilters;
  showLoadMore?: boolean;
  itemsPerPage?: number;
  variant?: 'default' | 'compact' | 'featured';
  onEnroll?: (programId: number) => void;
  className?: string;
}

export function ProgramList({ 
  filters = {}, 
  showLoadMore = true,
  itemsPerPage = 12,
  variant = 'default',
  onEnroll,
  className 
}: ProgramListProps) {
  const [programs, setPrograms] = useState<GymProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadPrograms = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const queryFilters = {
        ...filters,
        page,
        limit: itemsPerPage
      };

      const response = await programService.getPrograms(queryFilters);
      
      if (append) {
        setPrograms(prev => [...prev, ...response.programs]);
      } else {
        setPrograms(response.programs);
      }

      setHasMore(response.hasMore);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading programs:', err);
      setError('Failed to load programs. Please try again.');
      toast.error('Failed to load programs');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, itemsPerPage]);

  // Load initial programs
  useEffect(() => {
    loadPrograms(1, false);
  }, [loadPrograms]);

  // Reload when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadPrograms(1, false);
  }, [filters, loadPrograms]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadPrograms(currentPage + 1, true);
    }
  };

  const handleEnroll = (programId: number) => {
    if (onEnroll) {
      onEnroll(programId);
    } else {
      // Default enrollment action - redirect to program detail
      window.location.href = `/programs/${programId}`;
    }
  };

  const handleRetry = () => {
    setError(null);
    loadPrograms(1, false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-neutral-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No Programs Found
          </h3>
          <p className="text-neutral-600 mb-4">
            We couldn&apos;t find any programs matching your criteria. Try adjusting your filters.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <AnimatePresence mode="popLayout">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              layout
            >
              <ProgramCard
                program={program}
                variant={variant}
                onEnroll={handleEnroll}
                className="h-full"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {showLoadMore && hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="min-w-[200px]"
          >
            {isLoadingMore ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Loading More...
              </>
            ) : (
              'Load More Programs'
            )}
          </Button>
        </div>
      )}

      {/* No More Results Message */}
      {!hasMore && programs.length > 0 && showLoadMore && (
        <div className="text-center py-8">
          <p className="text-neutral-600">
            You&apos;ve seen all {programs.length} programs
          </p>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="text-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  );
}