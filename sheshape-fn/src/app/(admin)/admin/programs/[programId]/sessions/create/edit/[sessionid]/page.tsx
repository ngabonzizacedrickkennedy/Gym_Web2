// src/app/(admin)/admin/programs/[programId]/sessions/edit/[sessionId]/page.tsx
'use client';

import { use } from 'react';
import { SessionForm } from '@/components/admin/programs/SessionForm';

export default function EditSessionPage({ 
  params 
}: { 
  params: Promise<{ programId: string, sessionId: string }> 
}) {
  // Use React's `use` hook to unwrap the Promise
  const { programId, sessionId } = use(params);
  
  return <SessionForm 
    mode="edit" 
    programId={programId} 
    sessionId={sessionId}
  />;
}