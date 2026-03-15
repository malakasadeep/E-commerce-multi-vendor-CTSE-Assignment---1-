'use client';

import React, { useState } from 'react';
import { useSellerOrders, useUpdateOrderItemStatus } from '../../../../hooks/useOrders';
import { Card, CardContent } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  ShoppingBag,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
  processing: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-400' },
  shipped: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-400' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400' },
};

const ITEM_STATUSES = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
};

function getNextStatus(current: string): string | null {
  const idx = ITEM_STATUSES.indexOf(current);
  if (idx === -1 || idx >= ITEM_STATUSES.length - 1) return null;
  return ITEM_STATUSES[idx + 1];
}

export default function SellerOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useSellerOrders(page, 15, statusFilter || undefined);
  const updateStatus = useUpdateOrderItemStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] p-6 lg:p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    );
  }

  const orderItems = data?.orderItems || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-Poppins">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          {pagination?.total || 0} order items for your shop
        </p>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        <button
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
            statusFilter === ''
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Orders
        </button>
        {ITEM_STATUSES.map((status) => {
          const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isActive
                  ? `${style.bg} ${style.text} border ${style.border} shadow-sm`
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? style.dot : 'bg-gray-300'}`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {orderItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Qty</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Earnings</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item: any) => {
                  const nextStatus = getNextStatus(item.status);
                  const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
                  const NextIcon = nextStatus ? STATUS_ICONS[nextStatus] : null;
                  return (
                    <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-mono text-xs text-gray-500">
                        {item.order?.orderNumber || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {item.product?.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover ring-1 ring-gray-100"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                            {item.productName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {item.order?.user?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-emerald-600">
                          ${item.sellerAmount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">
                        ${item.platformFee.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} text-[10px] font-medium`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1`} />
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString('en', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        {nextStatus && item.status !== 'cancelled' && NextIcon ? (
                          <button
                            onClick={() =>
                              updateStatus.mutate({
                                orderId: item.orderId,
                                itemId: item.id,
                                status: nextStatus,
                              })
                            }
                            disabled={updateStatus.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <NextIcon className="w-3 h-3" />
                            {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : item.status === 'delivered' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-7 w-7 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No orders found</p>
              <p className="text-xs text-gray-400">
                {statusFilter ? 'Try changing your filter to see more orders' : 'Orders will appear here once customers purchase your products'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
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
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
