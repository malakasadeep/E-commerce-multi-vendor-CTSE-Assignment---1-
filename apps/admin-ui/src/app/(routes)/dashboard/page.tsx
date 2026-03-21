'use client';

import React from 'react';
import { useAdminStats, useAdminOrders } from '../../../hooks/useOrders';
import StatsCards from '../../../components/dashboard/StatsCards';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { STATUS_COLORS } from '../../../types';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders(1, 10);

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome to the Eshop admin dashboard
        </p>
      </div>

      {stats && <StatsCards stats={stats} />}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <Link
            href="/dashboard/orders"
            className="text-sm text-blue-600 hover:underline"
          >
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <Skeleton className="h-48" />
          ) : ordersData?.orders?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Service Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersData.orders.slice(0, 10).map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{order.user?.name || 'N/A'}</TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell className="font-semibold">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-green-600">
                      ${order.serviceFee.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          STATUS_COLORS[order.status] ||
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
