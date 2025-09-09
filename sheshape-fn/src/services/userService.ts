// src/services/userService.ts
import { api } from '@/lib/api';
import { User } from '@/types/user';

// API response interface for paginated results (if needed in future)
export interface UserListResponse {
  users: User[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// User creation/update interfaces
export interface CreateUserRequest {
  username: string;
  email: string;
  password?: string;
  role: 'CLIENT' | 'TRAINER' | 'NUTRITIONIST' | 'ADMIN';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: 'CLIENT' | 'TRAINER' | 'NUTRITIONIST' | 'ADMIN';
  isActive?: boolean;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// User service for admin operations
export const userService = {
  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/api/users');
    return response.data;
  },
  
  // Get users by role
  async getUsersByRole(role: 'TRAINER' | 'NUTRITIONIST'): Promise<User[]> {
    const endpoint = role === 'TRAINER' ? '/api/admin/trainers' : '/api/admin/nutritionists';
    const response = await api.get<User[]>(endpoint);
    return response.data;
  },
  
  // Get single user by ID
  async getUserById(userId: number): Promise<User> {
    const response = await api.get<User>(`/api/users/${userId}`);
    return response.data;
  },
  
  // Create new user (admin only)
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post<User>('/api/admin/users', userData);
    return response.data;
  },
  
  // Update user (admin only)
  async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>(`/api/users/${userId}`, userData);
    return response.data;
  },
  
  // Delete user (admin only)
  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/api/users/${userId}`);
  },
  
  // Toggle user active status
  async toggleUserStatus(userId: number, isActive: boolean): Promise<User> {
    const response = await api.put<User>(`/api/users/${userId}`, { isActive });
    return response.data;
  },
  
  // Get public trainers (for marketing pages)
  async getPublicTrainers(): Promise<User[]> {
    const response = await api.get<User[]>('/api/trainers');
    return response.data;
  },
  
  // Get public nutritionists (for marketing pages)
  async getPublicNutritionists(): Promise<User[]> {
    const response = await api.get<User[]>('/api/nutritionists');
    return response.data;
  },
  
  // Reset user password (admin only) - if endpoint exists
  async resetUserPassword(userId: number, newPassword: string): Promise<void> {
    await api.post(`/api/admin/users/${userId}/reset-password`, { newPassword });
  },
  
  // Send password reset email (admin only) - if endpoint exists  
  async sendPasswordResetEmail(userId: number): Promise<void> {
    await api.post(`/api/admin/users/${userId}/send-password-reset`);
  }
};