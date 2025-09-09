'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { ProgramFilters as ProgramFiltersType } from '@/types/models';
import { useDebounce } from '@/hooks/useDebounce';

const difficultyLevels = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' }
] as const;

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'duration_asc', label: 'Duration: Short to Long' },
  { value: 'duration_desc', label: 'Duration: Long to Short' }
] as const;

const programTags = [
  'Weight Loss',
  'Muscle Building',
  'Strength Training',
  'HIIT',
  'Cardio',
  'Yoga',
  'Pilates',
  'Dance',
  'Core',
  'Upper Body',
  'Lower Body',
  'Full Body'
] as const;

interface ProgramFiltersProps {
  filters: ProgramFiltersType;
  onFiltersChange: (filters: ProgramFiltersType) => void;
  className?: string;
}

export function ProgramFilters({ 
  filters, 
  onFiltersChange, 
  className 
}: ProgramFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 0, 
    filters.maxPrice || 500
  ]);
  const [durationRange, setDurationRange] = useState([
    1, 
    filters.maxDuration || 365
  ]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Sync state with props changes
  useEffect(() => {
    if (filters.search !== searchTerm && filters.search !== debouncedSearchTerm) {
      setSearchTerm(filters.search || '');
    }
  }, [filters.search,searchTerm,debouncedSearchTerm]);

  // Update price range when filters change
  useEffect(() => {
    const newMin = filters.minPrice || 0;
    const newMax = filters.maxPrice || 500;
    if (priceRange[0] !== newMin || priceRange[1] !== newMax) {
      setPriceRange([newMin, newMax]);
    }
  }, [filters.minPrice, filters.maxPrice,priceRange]);

  // Update duration range when filters change
  useEffect(() => {
    const newMax = filters.maxDuration || 365;
    if (durationRange[1] !== newMax) {
      setDurationRange([1, newMax]);
    }
  }, [filters.maxDuration,durationRange]);

  // Update filters when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      onFiltersChange({
        ...filters,
        search: debouncedSearchTerm || undefined,
        page: 1
      });
    }
  }, [debouncedSearchTerm]);

  const handlePriceRangeChange = useCallback((value: number[]) => {
    setPriceRange(value);
    onFiltersChange({
      ...filters,
      minPrice: value[0] > 0 ? value[0] : undefined,
      maxPrice: value[1] < 500 ? value[1] : undefined,
      page: 1
    });
  }, [filters, onFiltersChange]);

  const handleDurationRangeChange = useCallback((value: number[]) => {
    setDurationRange(value);
    onFiltersChange({
      ...filters,
      maxDuration: value[1] < 365 ? value[1] : undefined,
      page: 1
    });
  }, [filters, onFiltersChange]);

  const handleTagToggle = useCallback((tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
      page: 1
    });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setPriceRange([0, 500]);
    setDurationRange([1, 365]);
    onFiltersChange({
      page: 1,
      limit: filters.limit
    });
  }, [filters.limit, onFiltersChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    onFiltersChange({
      ...filters,
      sort: value as ProgramFiltersType['sort'],
      page: 1
    });
  }, [filters, onFiltersChange]);

  const handleDifficultyClick = useCallback((levelValue: string) => {
    onFiltersChange({
      ...filters,
      difficultyLevel: filters.difficultyLevel === levelValue 
        ? undefined 
        : levelValue as ProgramFiltersType['difficultyLevel'],
      page: 1
    });
  }, [filters, onFiltersChange]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    onFiltersChange({
      ...filters,
      search: undefined,
      page: 1
    });
  }, [filters, onFiltersChange]);

  const handleClearDifficulty = useCallback(() => {
    onFiltersChange({
      ...filters,
      difficultyLevel: undefined,
      page: 1
    });
  }, [filters, onFiltersChange]);

  const handleClearPrice = useCallback(() => {
    setPriceRange([0, 500]);
    onFiltersChange({
      ...filters,
      minPrice: undefined,
      maxPrice: undefined,
      page: 1
    });
  }, [filters, onFiltersChange]);

  const getActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.difficultyLevel) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.maxDuration) count++;
    if (filters.tags?.length) count += filters.tags.length;
    return count;
  }, [filters]);

  return (
    <div className={className}>
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search programs..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Sort Dropdown */}
        <Select
          value={filters.sort || 'newest'}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {getActiveFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFiltersCount}
            </Badge>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} />
        </Button>
      </div>

      {/* Active Filters */}
      {getActiveFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.search && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: &quot;{filters.search}&quot;
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={handleClearSearch}
              />
            </Badge>
          )}
          
          {filters.difficultyLevel && (
            <Badge variant="outline" className="flex items-center gap-1">
              {filters.difficultyLevel}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={handleClearDifficulty}
              />
            </Badge>
          )}

          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="outline" className="flex items-center gap-1">
              ${filters.minPrice || 0} - ${filters.maxPrice || 500}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={handleClearPrice}
              />
            </Badge>
          )}

          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-neutral-500 hover:text-neutral-700"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="mb-6">
              <CardContent className="p-6 space-y-6">
                {/* Difficulty Level */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Difficulty Level
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {difficultyLevels.map((level) => (
                      <Button
                        key={level.value}
                        variant={filters.difficultyLevel === level.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDifficultyClick(level.value)}
                      >
                        {level.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceRangeChange}
                    max={500}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Duration Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Max Duration: {durationRange[1]} days
                  </Label>
                  <Slider
                    value={durationRange}
                    onValueChange={handleDurationRangeChange}
                    max={365}
                    min={1}
                    step={7}
                    className="w-full"
                  />
                </div>

                {/* Program Tags */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Program Types
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {programTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={filters.tags?.includes(tag) || false}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <Label 
                          htmlFor={tag} 
                          className="text-sm cursor-pointer"
                        >
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}