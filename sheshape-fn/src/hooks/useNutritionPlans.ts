// src/hooks/useNutritionPlans.ts (Enhanced version)
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  nutritionService, 
  NutritionPlan, 
  NutritionPlanFormData,
  UserNutritionPlan
} from '@/services/nutritionService';

interface UseNutritionPlansOptions {
  initialFetch?: boolean;
  activeOnly?: boolean;
  userId?: number;
}

export function useNutritionPlans(options: UseNutritionPlansOptions = {}) {
  const { initialFetch = true, activeOnly = false, userId } = options;
  
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [userPlans, setUserPlans] = useState<UserNutritionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all nutrition plans (admin)
  const fetchAllPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await nutritionService.getAllPlans();
      setPlans(data);
      return data;
    } catch (err) {
      const errorMessage = 'Failed to fetch nutrition plans. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching nutrition plans:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch only active nutrition plans
  const fetchActivePlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await nutritionService.getActivePlans();
      setPlans(data);
      return data;
    } catch (err) {
      const errorMessage = 'Failed to fetch active nutrition plans. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching active nutrition plans:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user's nutrition plans
  const fetchUserPlans = useCallback(async (targetUserId?: number) => {
    const id = targetUserId || userId;
    if (!id) return [];

    setIsLoading(true);
    setError(null);
    try {
      const data = await nutritionService.getUserPlans(id);
      setUserPlans(data);
      return data;
    } catch (err) {
      const errorMessage = 'Failed to fetch user nutrition plans. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching user nutrition plans:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch a single nutrition plan by ID
  const fetchPlanById = useCallback(async (planId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await nutritionService.getPlanById(planId);
      return data;
    } catch (err) {
      const errorMessage = 'Failed to fetch nutrition plan details. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching nutrition plan:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new nutrition plan
  const createPlan = useCallback(async (planData: NutritionPlanFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPlan = await nutritionService.createPlan(planData);
      setPlans(prevPlans => [...prevPlans, newPlan]);
      toast.success('Nutrition plan created successfully');
      return newPlan;
    } catch (err) {
      const errorMessage = 'Failed to create nutrition plan. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error creating nutrition plan:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing nutrition plan
  const updatePlan = useCallback(async (planId: number, planData: NutritionPlanFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedPlan = await nutritionService.updatePlan(planId, planData);
      setPlans(prevPlans => 
        prevPlans.map(plan => plan.id === planId ? updatedPlan : plan)
      );
      toast.success('Nutrition plan updated successfully');
      return updatedPlan;
    } catch (err) {
      const errorMessage = 'Failed to update nutrition plan. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error updating nutrition plan:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a nutrition plan
  const deletePlan = useCallback(async (planId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await nutritionService.deletePlan(planId);
      setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      toast.success('Nutrition plan deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = 'Failed to delete nutrition plan. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error deleting nutrition plan:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Activate a nutrition plan
  const activatePlan = useCallback(async (planId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const activatedPlan = await nutritionService.activatePlan(planId);
      setPlans(prevPlans => 
        prevPlans.map(plan => plan.id === planId ? activatedPlan : plan)
      );
      toast.success('Plan activated successfully');
      return activatedPlan;
    } catch (err) {
      const errorMessage = 'Failed to activate plan. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error activating plan:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Deactivate a nutrition plan
  const deactivatePlan = useCallback(async (planId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const deactivatedPlan = await nutritionService.deactivatePlan(planId);
      setPlans(prevPlans => 
        prevPlans.map(plan => plan.id === planId ? deactivatedPlan : plan)
      );
      toast.success('Plan deactivated successfully');
      return deactivatedPlan;
    } catch (err) {
      const errorMessage = 'Failed to deactivate plan. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error deactivating plan:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Purchase a nutrition plan
  const purchasePlan = useCallback(async (targetUserId: number, planId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const userPlan = await nutritionService.purchasePlan(targetUserId, planId);
      setUserPlans(prevUserPlans => [...prevUserPlans, userPlan]);
      toast.success('Plan purchased successfully!');
      return userPlan;
    } catch (err) {
      const errorMessage = 'Failed to purchase plan. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error purchasing plan:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user plan status
  const updateUserPlanStatus = useCallback(async (targetUserId: number, planId: number, status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedUserPlan = await nutritionService.updateUserPlanStatus(targetUserId, planId, status);
      setUserPlans(prevUserPlans => 
        prevUserPlans.map(userPlan => 
          userPlan.userId === targetUserId && userPlan.planId === planId 
            ? updatedUserPlan 
            : userPlan
        )
      );
      toast.success('Plan status updated successfully');
      return updatedUserPlan;
    } catch (err) {
      const errorMessage = 'Failed to update plan status. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error updating plan status:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh data
  const refreshPlans = useCallback(() => {
    if (activeOnly) {
      return fetchActivePlans();
    } else {
      return fetchAllPlans();
    }
  }, [activeOnly, fetchActivePlans, fetchAllPlans]);

  const refreshUserPlans = useCallback(() => {
    if (userId) {
      return fetchUserPlans();
    }
    return Promise.resolve([]);
  }, [userId, fetchUserPlans]);

  // Load plans on component mount
  useEffect(() => {
    if (initialFetch) {
      if (userId) {
        fetchUserPlans();
      } else if (activeOnly) {
        fetchActivePlans();
      } else {
        fetchAllPlans();
      }
    }
  }, [initialFetch, activeOnly, userId, fetchActivePlans, fetchAllPlans, fetchUserPlans]);

  return {
    // State
    plans,
    userPlans,
    isLoading,
    error,
    
    // Actions
    fetchAllPlans,
    fetchActivePlans,
    fetchUserPlans,
    fetchPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    activatePlan,
    deactivatePlan,
    purchasePlan,
    updateUserPlanStatus,
    refreshPlans,
    refreshUserPlans,
    
    // Utilities
    clearError: () => setError(null),
    setLoading: setIsLoading
  };
}