// src/app/(admin)/admin/users/[id]/edit/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { UserForm } from '@/components/admin/users/UserForm';

export default function EditUserPage() {
  const params = useParams();
  const userId = parseInt(params.id as string);

  return <UserForm userId={userId} mode="edit" />;
}