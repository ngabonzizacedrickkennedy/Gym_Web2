import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { profileService, ProfileResponse, UserProfileSummary } from '@/services/profileService';
import { toast } from 'react-toastify';

// Define proper error types
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileSummary, setProfileSummary] = useState<UserProfileSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load full profile - wrapped in useCallback to fix exhaustive-deps warning
  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const profileData = await profileService.getUserProfile();
      setProfile(profileData);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Failed to load profile:', apiError);
      setError(apiError.response?.data?.message || apiError.message || 'Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load profile summary
  const loadProfileSummary = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const summaryData = await profileService.getUserProfileSummary();
      setProfileSummary(summaryData);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Failed to load profile summary:', apiError);
      setError(apiError.response?.data?.message || apiError.message || 'Failed to load profile summary');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load profile on mount or user change
  useEffect(() => {
    if (user && user.profileCompleted) {
      loadProfile();
    }
  }, [user, loadProfile]);

  return {
    profile,
    profileSummary,
    isLoading,
    error,
    loadProfile,
    loadProfileSummary,
    refetch: loadProfile,
  };
}

export default useProfile;