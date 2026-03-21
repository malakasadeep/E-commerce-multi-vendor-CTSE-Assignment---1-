'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '../../../hooks/useProducts';
import { ProductCard } from '../../../components/products/ProductCard';
import { CategoryFilter } from '../../../components/products/CategoryFilter';
import { Skeleton } from '../../../components/ui/skeleton';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  const { data, isLoading } = useProducts({
    page,
    limit: 12,
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  return (
    <div className="w-[90%] max-w-7xl mx-auto py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-Poppins">
          {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
        </h1>
        {data?.pagination && (
          <p className="text-gray-500 text-sm mt-1">
            {data.pagination.total} products found
          </p>
        )}
      </div>

      {/* Category Filter */}
      {!searchQuery && (
        <div className="mb-6 overflow-x-auto pb-2">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={handleCategoryChange}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && data?.products && data.products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data?.products && data.products.length === 0 && (
        <div className="text-center py-16">
          <PackageOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? 'Try adjusting your search terms'
              : selectedCategory
                ? 'No products in this category yet'
                : 'Products will appear here once sellers add them'}
          </p>
          {(searchQuery || selectedCategory) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedCategory('');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
