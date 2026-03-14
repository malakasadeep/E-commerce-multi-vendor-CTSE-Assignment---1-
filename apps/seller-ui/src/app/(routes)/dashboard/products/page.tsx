'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSellerProducts, useDeleteProduct } from '../../../../hooks/useProducts';
import { Product } from '../../../../types/product';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { DeleteProductDialog } from '../../../../components/products/DeleteProductDialog';
import { Plus, Pencil, Trash2, Package, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSellerProducts(page);
  const deleteProduct = useDeleteProduct();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProduct.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const products = data?.products || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination?.total || 0} total products
          </p>
        </div>
        <Link href="/dashboard/products/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-6">Start by creating your first product</p>
          <Link href="/dashboard/products/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Product
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Sold</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {product.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <span className="font-semibold">${product.price.toFixed(2)}</span>
                        {product.discountPrice && (
                          <span className="block text-xs text-green-600">
                            ${product.discountPrice.toFixed(2)} sale
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-gray-600">{product.sold_out}</TableCell>
                    <TableCell className="text-center text-gray-600">
                      {product.ratings > 0 ? product.ratings.toFixed(1) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {deleteTarget && (
        <DeleteProductDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          productName={deleteTarget.name}
          onConfirm={handleDelete}
          isDeleting={deleteProduct.isPending}
        />
      )}
    </div>
  );
}
