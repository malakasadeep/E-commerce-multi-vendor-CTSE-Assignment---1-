'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ProductImageUpload } from './ProductImageUpload';
import { PRODUCT_CATEGORIES, Product } from '../../types/product';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  tags: string;
  stock: string;
}

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    category: string;
    tags: string[];
    stock: number;
    images: { url: string; file_id?: string }[];
  }) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function ProductForm({ initialData, onSubmit, isSubmitting, submitLabel }: ProductFormProps) {
  const [images, setImages] = React.useState<{ url: string; file_id?: string }[]>(
    initialData?.images?.map((img) => ({ url: img.url, file_id: img.file_id })) || []
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price?.toString() || '',
      discountPrice: initialData?.discountPrice?.toString() || '',
      category: initialData?.category || '',
      tags: initialData?.tags?.join(', ') || '',
      stock: initialData?.stock?.toString() || '0',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price.toString(),
        discountPrice: initialData.discountPrice?.toString() || '',
        category: initialData.category,
        tags: initialData.tags?.join(', ') || '',
        stock: initialData.stock.toString(),
      });
      setImages(initialData.images?.map((img) => ({ url: img.url, file_id: img.file_id })) || []);
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: ProductFormData) => {
    onSubmit({
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : undefined,
      category: data.category,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      stock: parseInt(data.stock) || 0,
      images,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              {...register('name', { required: 'Product name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your product..."
              rows={4}
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('category', { required: 'Category is required' })}
            >
              <option value="">Select a category</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="e.g. wireless, bluetooth, portable"
              {...register('tags')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' },
                })}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPrice">Discount Price ($)</Label>
              <Input
                id="discountPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('discountPrice')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="0"
                {...register('stock', {
                  required: 'Stock is required',
                  min: { value: 0, message: 'Stock cannot be negative' },
                })}
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductImageUpload images={images} onChange={setImages} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
