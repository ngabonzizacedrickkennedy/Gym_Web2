'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

interface ShopErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShopError({ error, reset }: ShopErrorProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Something went wrong!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              We encountered an error while loading the shop. This might be a temporary issue.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="text-left">
                <details className="bg-gray-50 rounded-lg p-4 text-sm">
                  <summary className="font-medium cursor-pointer">Error Details</summary>
                  <div className="mt-2 text-red-600">
                    <pre className="whitespace-pre-wrap text-xs">
                      {error.message}
                    </pre>
                  </div>
                </details>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}