'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '../../../../../hooks/useProducts';
import { ProductForm } from '../../../../../components/products/ProductForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const [error, setError] = React.useState('');

  const handleSubmit = (data: {
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
    createProduct.mutate(data, {
      onSuccess: () => {
        router.push('/dashboard/products');
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message || 'Failed to create product');
      },
    });
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
            <p className="text-gray-500 text-sm">Add a new product to your shop</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <ProductForm
          onSubmit={handleSubmit}
          isSubmitting={createProduct.isPending}
          submitLabel="Create Product"
        />
      </div>
    </div>
  );
}
