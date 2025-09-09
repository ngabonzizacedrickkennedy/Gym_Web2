// src/components/admin/users/UserForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { userService, CreateUserRequest, UpdateUserRequest } from '@/services/userService';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  Save, 
  ArrowLeft, 
  User as UserIcon,
  Lock,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

// Form validation schema
const userFormSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(50, { message: 'Username must be less than 50 characters' })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: 'Username can only contain letters, numbers, hyphens, and underscores' }),
  email: z.string()
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .optional()
    .or(z.literal('')),
  confirmPassword: z.string().optional(),
  role: z.enum(['CLIENT', 'TRAINER', 'NUTRITIONIST', 'ADMIN'], {
    required_error: 'Please select a role',
  }),
  isActive: z.boolean().default(true),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  userId?: number;
  mode: 'create' | 'edit';
}

export function UserForm({ userId, mode }: UserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'CLIENT',
      isActive: true,
    },
  });

  const watchedRole = watch('role');
  const watchedPassword = watch('password');

  // Load user data for editing
  useEffect(() => {
    if (mode === 'edit' && userId) {
      loadUser();
    }
  }, [mode, userId]);

  const loadUser = async () => {
    if (!userId) return;
    
    setIsLoadingUser(true);
    setError(null);
    
    try {
      const userData = await userService.getUserById(userId);
      setUser(userData);
      
      // Populate form with user data
      reset({
        username: userData.username,
        email: userData.email,
        password: '', // Don't populate password for security
        confirmPassword: '',
        role: userData.role as 'CLIENT' | 'TRAINER' | 'NUTRITIONIST' | 'ADMIN',
        isActive: userData.profileCompleted, // Using profileCompleted as proxy for isActive
      });
    } catch (err) {
      console.error('Failed to load user:', err);
      setError('Failed to load user data');
      toast.error('Failed to load user data');
    } finally {
      setIsLoadingUser(false);
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        // Create new user
        const createData: CreateUserRequest = {
          username: data.username,
          email: data.email,
          password: data.password || undefined,
          role: data.role,
        };
        
        await userService.createUser(createData);
        toast.success('User created successfully');
        router.push('/admin/users');
      } else if (mode === 'edit' && userId) {
        // Update existing user
        const updateData: UpdateUserRequest = {
          username: data.username,
          email: data.email,
          role: data.role,
          isActive: data.isActive,
        };
        
        await userService.updateUser(userId, updateData);
        toast.success('User updated successfully');
        router.push(`/admin/users/${userId}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save user';
      console.error('Failed to save user:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Role descriptions
  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'CLIENT':
        return 'Regular user who can purchase programs and plans';
      case 'TRAINER':
        return 'Can create and manage fitness programs';
      case 'NUTRITIONIST':
        return 'Can create and manage nutrition plans';
      case 'ADMIN':
        return 'Full access to all admin features';
      default:
        return '';
    }
  };

  if (isLoadingUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={mode === 'edit' && userId ? `/admin/users/${userId}` : '/admin/users'}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'create' ? 'Create New User' : `Edit User: ${user?.username}`}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Add a new user to the system'
              : 'Update user information and permissions'
            }
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  className={errors.username ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              {mode === 'create' ? 'Password' : 'Change Password'}
            </CardTitle>
            {mode === 'edit' && (
              <p className="text-sm text-muted-foreground">
                Leave password fields empty to keep current password
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {mode === 'create' ? 'Password' : 'New Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={mode === 'create' ? 'Enter password' : 'Enter new password'}
                  className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  className={errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Password Requirements */}
            {(mode === 'create' || watchedPassword) && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Password requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>At least 6 characters long</li>
                  <li>Mix of letters and numbers recommended</li>
                  <li>Special characters are allowed</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role and Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Role and Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <Select
                value={watchedRole}
                onValueChange={(value) => setValue('role', value as 'CLIENT' | 'TRAINER' | 'NUTRITIONIST' | 'ADMIN')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="TRAINER">Trainer</SelectItem>
                  <SelectItem value="NUTRITIONIST">Nutritionist</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role.message}</p>
              )}
              
              {/* Role Description */}
              {watchedRole && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>{watchedRole}:</strong> {getRoleDescription(watchedRole)}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Active Status - Only for edit mode */}
            {mode === 'edit' && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Account Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Deactivated users cannot log in to the system
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
              </div>
            )}

            {/* Role-specific warnings */}
            {watchedRole === 'ADMIN' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Admin users have full access to all system features including user management, content creation, and system settings. Only grant admin access to trusted users.
                </AlertDescription>
              </Alert>
            )}

            {(watchedRole === 'TRAINER' || watchedRole === 'NUTRITIONIST') && (
              <Alert>
                <AlertDescription>
                  <strong>Note:</strong> {watchedRole === 'TRAINER' ? 'Trainers' : 'Nutritionists'} can create and manage their own {watchedRole === 'TRAINER' ? 'fitness programs' : 'nutrition plans'} and view assigned clients.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Summary Card - Only for create mode */}
        {mode === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span>{watch('username') || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{watch('email') || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span>{watch('role')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Password:</span>
                  <span>{watch('password') ? 'Set' : 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <Card>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={mode === 'edit' && userId ? `/admin/users/${userId}` : '/admin/users'}>
                Cancel
              </Link>
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoading}
              className="min-w-[120px]"
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Create User' : 'Update User'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}