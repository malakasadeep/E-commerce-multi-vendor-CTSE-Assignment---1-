'use client';

import React, { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '../../../../hooks/useOrders';
import { Card, CardContent } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { ORDER_STATUSES, STATUS_COLORS } from '../../../../types';
import Link from 'next/link';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useAdminOrders(page, 15, statusFilter || undefined);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-500 text-sm mt-1">{pagination?.total || 0} total orders</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setStatusFilter(''); setPage(1); }}
        >
          All
        </Button>
        {ORDER_STATUSES.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setStatusFilter(status); setPage(1); }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Service Fee (20%)</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{order.user?.name || 'N/A'}</TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell>${order.subtotal.toFixed(2)}</TableCell>
                    <TableCell className="text-green-600 font-medium">${order.serviceFee.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus.mutate({ id: order.id, status: 'confirmed' })}
                          disabled={updateStatus.isPending}
                        >
                          Confirm
                        </Button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'refunded' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 ml-1"
                          onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}
                          disabled={updateStatus.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No orders found</p>
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
