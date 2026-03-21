'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useSellerProducts,
  useDeleteProduct,
} from '../../../../hooks/useProducts';
import { Product } from '../../../../types/product';
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
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

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
      <div className="min-h-screen bg-[#f8f9fc] p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const products = data?.products || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-Poppins">
            Products
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination?.total || 0} total products in your store
          </p>
        </div>
        <Link
          href="/dashboard/products/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Create Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
            <Package className="h-9 w-9 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products yet
          </h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Start building your store by creating your first product
          </p>
          <Link
            href="/dashboard/products/create"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            Create Your First Product
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                    Image
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Price
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                    Stock
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                    Sold
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                    Rating
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <TableCell>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-11 h-11 rounded-xl object-cover ring-1 ring-gray-100 group-hover:ring-indigo-200 transition-all"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center ring-1 ring-gray-100">
                          <ImageIcon className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">
                          {product.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-medium">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.discountPrice && (
                          <span className="block text-xs font-medium text-emerald-600">
                            ${product.discountPrice.toFixed(2)} sale
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {product.stock > 0 ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                          {product.stock}
                        </Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-medium">
                          <AlertCircle className="w-3 h-3 mr-0.5" />
                          Out
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <TrendingUp className="w-3 h-3 text-gray-400" />
                        {product.sold_out}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {product.ratings > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {product.ratings.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/products/${product.id}`}>
                          <button className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(pagination.totalPages, 5) },
                  (_, i) => i + 1
                ).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      page === p
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {deleteTarget && (
        <DeleteProductDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          productName={deleteTarget.name}
          onConfirm={handleDelete}
          isDeleting={deleteProduct.isPending}
        />
      )}
    </div>
  );
}
