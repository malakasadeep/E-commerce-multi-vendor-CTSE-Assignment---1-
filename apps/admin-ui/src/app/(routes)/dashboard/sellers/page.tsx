'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../../utils/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { ChevronLeft, ChevronRight, Store, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function SellersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sellers', page],
    queryFn: async () => {
      // Fetch all sellers via product-service admin endpoint or directly
      const res = await axiosInstance.get(`/product-api/products?page=1&limit=1000`);
      // Extract unique sellers
      const products = res.data.products || [];
      const sellerMap = new Map();
      products.forEach((p: any) => {
        if (p.shop && !sellerMap.has(p.sellerId)) {
          sellerMap.set(p.sellerId, {
            id: p.sellerId,
            shopId: p.shopId,
            shopName: p.shop.name,
            shopCategory: p.shop.category,
            shopAddress: p.shop.address,
            productCount: 0,
          });
        }
        if (sellerMap.has(p.sellerId)) {
          sellerMap.get(p.sellerId).productCount++;
        }
      });
      return { sellers: Array.from(sellerMap.values()), total: sellerMap.size };
    },
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const sellers = data?.sellers || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sellers Management</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.total || 0} sellers registered</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {sellers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Products</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((seller: any) => (
                  <TableRow key={seller.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Store className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{seller.shopName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{seller.shopCategory}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{seller.shopAddress}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{seller.productCount} products</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Store className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No sellers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
