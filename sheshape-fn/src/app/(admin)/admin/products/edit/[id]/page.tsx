// src/app/(admin)/admin/products/edit/[id]/page.tsx
'use client';

import { use } from 'react';
import { ProductForm } from '@/components/admin/products/ProductForm';

export default function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Use React's `use` hook to unwrap the Promise
  const { id } = use(params);
  const productId = parseInt(id);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        <p className="text-muted-foreground">
          Update your product information
        </p>
      </div>
      
      <ProductForm productId={productId} />
    </div>
  );
}