import { api } from '@/lib/api';
import { User } from '@/types/user';

// Define response types for better TypeScript support
interface LoginResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  role: string;
  authorities: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

// interface PasswordResetRequest {
//   email: string;
// }

// interface PasswordUpdateRequest {
//   current: string;
//   new: string;
// }

interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  profileImage?: string;
}

// Auth service with API calls
export const authService = {
  // Login user
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', { email, password });
    return response.data;
  },
  
  // Register new user
  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/api/auth/register', data);
    return response.data;
  },
  
  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },
  
  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/api/auth/forgot-password', { email });
  },
  
  // Reset password with token
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/api/auth/reset-password', { token, password });
  },
  
  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<User> {
    const response = await api.put<User>('/api/auth/password', null, {
      params: {
        current: currentPassword,
        new: newPassword
      }
    });
    return response.data;
  },
  
  // Update user profile
  async updateProfile(userId: number, profileData: ProfileUpdateRequest): Promise<User> {
    const response = await api.put<User>(`/api/users/${userId}/profile`, profileData);
    return response.data;
  },
  
  // Upload profile image
  // Replace the existing uploadProfileImage method with:
// Upload profile image
// Upload profile image
async uploadProfileImage(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file); // CHANGED: 'image' to 'file' to match backend
    
    const response = await api.post<{
      success: boolean;
      message: string;
      data: {
        profilePictureUrl: string;
        fileName: string;
        fileSize: number;
        contentType: string;
        uploadedAt: string;
      };
    }>(
      '/api/profile/picture', 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // ADDED: Proper response handling
    if (response.data.success) {
      return response.data.data.profilePictureUrl;
    } else {
      throw new Error(response.data.message || 'Failed to upload image');
    }
  } catch (error: any) {
    console.error('Profile image upload error:', error);
    
    // ADDED: Better error handling
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to upload profile image');
    }
  }
}
};