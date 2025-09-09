// src/app/(admin)/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userService } from '@/services/userService';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Eye,
  SlidersHorizontal,
  Download,
  UserPlus,
} from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'react-toastify';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await userService.getAllUsers();
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and tab
  useEffect(() => {
    let filtered = users;

    // Filter by role tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(user => user.role.toLowerCase() === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.profile?.firstName && user.profile.firstName.toLowerCase().includes(query)) ||
        (user.profile?.lastName && user.profile.lastName.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, activeTab]);

  // Handle user deletion
  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error('Failed to delete user');
    }
  };

  // Handle user status toggle
  const handleToggleUserStatus = async (userId: number, currentStatus: boolean, username: string) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} user "${username}"?`)) {
      return;
    }

    try {
      await userService.toggleUserStatus(userId, !currentStatus);
      toast.success(`User ${action}d successfully`);
      fetchUsers(); // Refresh the list
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

  // Get user counts by role
  const getUserCounts = () => {
    const counts = {
      all: users.length,
      client: users.filter(u => u.role === 'CLIENT').length,
      trainer: users.filter(u => u.role === 'TRAINER').length,
      nutritionist: users.filter(u => u.role === 'NUTRITIONIST').length,
      admin: users.filter(u => u.role === 'ADMIN').length,
    };
    return counts;
  };

  const counts = getUserCounts();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">
              Manage all users, roles, and permissions
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchUsers} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage all users, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/admin/users/new">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Link>
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="text-xs">
                  All ({counts.all})
                </TabsTrigger>
                <TabsTrigger value="client" className="text-xs">
                  Clients ({counts.client})
                </TabsTrigger>
                <TabsTrigger value="trainer" className="text-xs">
                  Trainers ({counts.trainer})
                </TabsTrigger>
                <TabsTrigger value="nutritionist" className="text-xs">
                  Nutritionists ({counts.nutritionist})
                </TabsTrigger>
                <TabsTrigger value="admin" className="text-xs">
                  Admins ({counts.admin})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Users ({filteredUsers.length})</h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'all' ? 'All users' : `Users with role: ${activeTab}`}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-[80px]" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'No users match the selected filter'}
              </p>
              {activeTab === 'all' && !searchQuery && (
                <Button asChild>
                  <Link href="/admin/users/new">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First User
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={user.profile?.profilePictureUrl} 
                            alt={getUserDisplayName(user)} 
                          />
                          <AvatarFallback>
                            {getInitials(getUserDisplayName(user))}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {getUserDisplayName(user)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          user.profileCompleted 
                            ? 'border-green-500 text-green-700 bg-green-50' 
                            : 'border-yellow-500 text-yellow-700 bg-yellow-50'
                        }
                      >
                        {user.profileCompleted ? 'Active' : 'Incomplete Profile'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {formatDate(user.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit User</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleToggleUserStatus(
                              user.id, 
                              user.profileCompleted, 
                              getUserDisplayName(user)
                            )}
                          >
                            {user.profileCompleted ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                <span>Activate</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id, getUserDisplayName(user))}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete User</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}