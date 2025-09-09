// src/app/(admin)/admin/programs/edit/[id]/page.tsx
import { use } from 'react';
import { ProgramForm } from '@/components/admin/programs/ProgramForm';

export default function EditProgramPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Use React's `use` hook to unwrap the Promise
  const { id } = use(params);
  
  return <ProgramForm mode="edit" programId={id} />;
}