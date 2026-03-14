'use client';

import React, { useState } from 'react';
import { useSellerOrders, useUpdateOrderItemStatus } from '../../../../hooks/useOrders';
import { Card, CardContent } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { ChevronLeft, ChevronRight, Package, Truck, CheckCircle, ShoppingBag } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const ITEM_STATUSES = ['pending', 'processing', 'shipped', 'delivered'];

function getNextStatus(current: string): string | null {
  const idx = ITEM_STATUSES.indexOf(current);
  if (idx === -1 || idx >= ITEM_STATUSES.length - 1) return null;
  return ITEM_STATUSES[idx + 1];
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'shipped': return <Truck className="h-3.5 w-3.5 mr-1" />;
    case 'delivered': return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
    case 'processing': return <Package className="h-3.5 w-3.5 mr-1" />;
    default: return null;
  }
}

export default function SellerOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useSellerOrders(page, 15, statusFilter || undefined);
  const updateStatus = useUpdateOrderItemStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const orderItems = data?.orderItems || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          {pagination?.total || 0} order items for your shop
        </p>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setStatusFilter(''); setPage(1); }}
        >
          All
        </Button>
        {ITEM_STATUSES.map((status) => (
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
          {orderItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Your Earnings</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item: any) => {
                  const nextStatus = getNextStatus(item.status);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        {item.order?.orderNumber || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.product?.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt=""
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <span className="text-sm font-medium truncate max-w-[150px]">
                            {item.productName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.order?.user?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ${item.sellerAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        ${item.platformFee.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-800'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {nextStatus && item.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatus.mutate({
                                orderId: item.orderId,
                                itemId: item.id,
                                status: nextStatus,
                              })
                            }
                            disabled={updateStatus.isPending}
                          >
                            {getStatusIcon(nextStatus)}
                            {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                          </Button>
                        )}
                        {item.status === 'delivered' && (
                          <span className="text-xs text-green-600 font-medium">Completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
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
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
