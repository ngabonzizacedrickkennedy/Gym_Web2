// src/app/(admin)/admin/users/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { userService } from '@/services/userService';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Activity,
  Target,
  Clock,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'react-toastify';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = parseInt(params.id as string);
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user details
  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await userService.getUserById(userId);
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Failed to load user details. Please try again.');
      toast.error('Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!user) return;
    
    const displayName = getUserDisplayName(user);
    if (!confirm(`Are you sure you want to delete user "${displayName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await userService.deleteUser(user.id);
      toast.success('User deleted successfully');
      router.push('/admin/users');
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error('Failed to delete user');
    }
  };

  // Handle user status toggle
  const handleToggleUserStatus = async () => {
    if (!user) return;
    
    const action = user.profileCompleted ? 'deactivate' : 'activate';
    const displayName = getUserDisplayName(user);
    
    if (!confirm(`Are you sure you want to ${action} user "${displayName}"?`)) {
      return;
    }

    try {
      const updatedUser = await userService.toggleUserStatus(user.id, !user.profileCompleted);
      setUser(updatedUser);
      toast.success(`User ${action}d successfully`);
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      toast.error(`Failed to ${action} user`);
    }
  };

  // Get role color for badges
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'trainer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'nutritionist':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'client':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get user display name
  const getUserDisplayName = (user: User) => {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    return user.username;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !user) {
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
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">User Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'The user you are looking for could not be found.'}
            </p>
            <div className="space-x-2">
              <Button onClick={fetchUser} variant="outline">
                Try Again
              </Button>
              <Button asChild>
                <Link href="/admin/users">
                  Back to Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={user.profile?.profilePictureUrl} 
                alt={getUserDisplayName(user)} 
              />
              <AvatarFallback>
                {getInitials(getUserDisplayName(user))}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold">{getUserDisplayName(user)}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={
                    user.profileCompleted 
                      ? 'border-green-500 text-green-700 bg-green-50' 
                      : 'border-yellow-500 text-yellow-700 bg-yellow-50'
                  }
                >
                  {user.profileCompleted ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/users/${user.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleUserStatus}
          >
            {user.profileCompleted ? (
              <>
                <UserX className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDeleteUser}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">@{user.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{user.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <p className="text-sm">{user.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                  <p className="text-sm">
                    {user.profileCompleted ? 'Active' : 'Profile Incomplete'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          {user.profile && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.profile.firstName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <p className="text-sm">{user.profile.firstName}</p>
                    </div>
                  )}
                  {user.profile.lastName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <p className="text-sm">{user.profile.lastName}</p>
                    </div>
                  )}
                  {user.profile.phoneNumber && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{user.profile.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                  {user.profile.dateOfBirth && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                      <p className="text-sm">{formatDate(user.profile.dateOfBirth)}</p>
                    </div>
                  )}
                  {user.profile.gender && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Gender</label>
                      <p className="text-sm">{user.profile.gender}</p>
                    </div>
                  )}
                  {user.profile.timezone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{user.profile.timezone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {user.profile.bio && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bio</label>
                      <p className="text-sm mt-1 text-muted-foreground">{user.profile.bio}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fitness Information */}
          {user.profile && (user.profile.fitnessLevel || user.profile.primaryGoal || user.profile.heightCm) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Fitness Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.profile.fitnessLevel && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fitness Level</label>
                      <p className="text-sm">{user.profile.fitnessLevel}</p>
                    </div>
                  )}
                  {user.profile.primaryGoal && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Primary Goal</label>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{user.profile.primaryGoal.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}
                  {user.profile.heightCm && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Height</label>
                      <p className="text-sm">{user.profile.heightCm} cm</p>
                    </div>
                  )}
                  {user.profile.currentWeightKg && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current Weight</label>
                      <p className="text-sm">{user.profile.currentWeightKg} kg</p>
                    </div>
                  )}
                  {user.profile.targetWeightKg && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Target Weight</label>
                      <p className="text-sm">{user.profile.targetWeightKg} kg</p>
                    </div>
                  )}
                  {user.profile.workoutFrequency && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Workout Frequency</label>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{user.profile.workoutFrequency} times/week</p>
                      </div>
                    </div>
                  )}
                </div>

                {user.profile.preferredActivityTypes && user.profile.preferredActivityTypes.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Preferred Activities</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.profile.preferredActivityTypes.map((activity, index) => (
                          <Badge key={index} variant="secondary">
                            {activity.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {user.profile.secondaryGoals && user.profile.secondaryGoals.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Secondary Goals</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.profile.secondaryGoals.map((goal, index) => (
                          <Badge key={index} variant="outline">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Health Information */}
          {user.profile && (user.profile.dietaryRestrictions || user.profile.healthConditions || user.profile.emergencyContactName) && (
            <Card>
              <CardHeader>
                <CardTitle>Health Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.profile.emergencyContactName && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                      <p className="text-sm">{user.profile.emergencyContactName}</p>
                    </div>
                    {user.profile.emergencyContactPhone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Emergency Phone</label>
                        <p className="text-sm">{user.profile.emergencyContactPhone}</p>
                      </div>
                    )}
                  </div>
                )}

                {user.profile.dietaryRestrictions && user.profile.dietaryRestrictions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dietary Restrictions</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.profile.dietaryRestrictions.map((restriction, index) => (
                        <Badge key={index} variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {user.profile.healthConditions && user.profile.healthConditions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Health Conditions</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.profile.healthConditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="border-red-200 text-red-700 bg-red-50">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/admin/users/${user.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              
              {user.role === 'TRAINER' && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/admin/programs?trainer=${user.id}`}>
                    <Activity className="h-4 w-4 mr-2" />
                    View Programs
                  </Link>
                </Button>
              )}
              
              {user.role === 'NUTRITIONIST' && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/admin/nutrition?nutritionist=${user.id}`}>
                    <Target className="h-4 w-4 mr-2" />
                    View Plans
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              
              <Separator />
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleToggleUserStatus}
              >
                {user.profileCompleted ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate User
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate User
                  </>
                )}
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleDeleteUser}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </CardContent>
          </Card>

          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account Age</span>
                  <span>{Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Active</span>
                  <span>{formatDate(user.updatedAt)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profile Completed</span>
                  <span>{user.profileCompleted ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          {user.profile && (
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {user.profile.emailNotifications !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email Notifications</span>
                      <span>{user.profile.emailNotifications ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  )}
                  
                  {user.profile.pushNotifications !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Push Notifications</span>
                      <span>{user.profile.pushNotifications ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  )}
                  
                  {user.profile.privacyLevel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Privacy Level</span>
                      <span>{user.profile.privacyLevel}</span>
                    </div>
                  )}
                  
                  {user.profile.language && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Language</span>
                      <span>{user.profile.language}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}