'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProduct, useUpdateProduct } from '../../../../../hooks/useProducts';
import { ProductForm } from '../../../../../components/products/ProductForm';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { Button } from '../../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();
  const [error, setError] = React.useState('');

  const handleSubmit = (formData: {
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    category: string;
    tags: string[];
    stock: number;
    images: { url: string }[];
  }) => {
    setError('');
    updateProduct.mutate(
      { id, ...formData },
      {
        onSuccess: () => {
          router.push('/dashboard/products');
        },
        onError: (err: any) => {
          setError(err?.response?.data?.message || 'Failed to update product');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Product not found</p>
        <Link href="/dashboard/products">
          <Button variant="outline" className="mt-4">
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-500 text-sm">Update product details</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <ProductForm
          initialData={data.product}
          onSubmit={handleSubmit}
          isSubmitting={updateProduct.isPending}
          submitLabel="Update Product"
        />
      </div>
    </div>
  );
}
