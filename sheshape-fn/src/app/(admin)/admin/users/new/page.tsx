// src/app/(admin)/admin/users/new/page.tsx
'use client';

import { UserForm } from '@/components/admin/users/UserForm';

export default function CreateUserPage() {
  return <UserForm mode="create" />;
}