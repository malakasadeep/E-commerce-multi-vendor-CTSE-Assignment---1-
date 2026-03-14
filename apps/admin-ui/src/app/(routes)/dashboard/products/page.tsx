'use client';

import React, { useState } from 'react';
import { useAdminProducts } from '../../../../hooks/useProducts';
import { Card, CardContent } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { ChevronLeft, ChevronRight, Package, Star, ImageIcon } from 'lucide-react';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminProducts(page, 15);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const products = data?.products || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <p className="text-gray-500 text-sm mt-1">{pagination?.total || 0} products total</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Shop</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {product.discountPrice ? (
                        <div>
                          <span className="font-semibold text-red-600">${product.discountPrice.toFixed(2)}</span>
                          <span className="text-xs text-gray-400 line-through ml-1">${product.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-semibold">${product.price.toFixed(2)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{product.ratings > 0 ? product.ratings.toFixed(1) : '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.sold_out}</TableCell>
                    <TableCell className="text-sm text-gray-500">{product.shop?.name || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-gray-600">Page {page} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
