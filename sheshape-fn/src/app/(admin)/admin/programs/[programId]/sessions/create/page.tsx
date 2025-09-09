'use client';

import { use } from 'react';
import { SessionForm } from '@/components/admin/programs/SessionForm';

export default function CreateSessionPage({ 
  params 
}: { 
  params: Promise<{ programId: string }> 
}) {
  // Use React's `use` hook to unwrap the Promise
  const { programId } = use(params);
  
  return <SessionForm mode="create" programId={programId} />;
}