'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../../utils/axiosInstance';
import { Card, CardContent } from '../../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Users, Mail } from 'lucide-react';

export default function CustomersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-customers'],
    queryFn: async () => {
      // For now, we display stats. Full customer list requires an admin endpoint.
      const res = await axiosInstance.get('/order-api/admin/stats');
      return res.data.stats;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">
          {data?.totalUsers || 0} registered customers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{data?.totalUsers || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{data?.totalOrders || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Orders Placed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold">{data?.totalSellers || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Active Sellers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500 py-8">
            Customer list with detailed profiles will be available once the
            admin customer endpoint is connected. Currently showing aggregated
            stats from the order service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
