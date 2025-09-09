import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ArrowLeft, Home, Search } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Package className="h-8 w-8 text-gray-600" />
            </div>
            <CardTitle className="text-xl">Product Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              The product you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop">
                <Button className="flex items-center gap-2 w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Shop
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Search className="h-4 w-4" />
                  Browse Products
                </Button>
              </Link>
            </div>
            
            <div className="pt-4 border-t">
              <Link href="/">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}