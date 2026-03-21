'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserOrders } from '../../../hooks/useOrders';
import useUser from '../../../hooks/useUser';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { ChevronLeft, ChevronRight, Package, ShoppingBag } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserOrders(page, 10);

  if (!userLoading && !user) {
    router.replace('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-[90%] max-w-7xl mx-auto py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  return (
    <div className="w-[90%] max-w-7xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 font-Poppins mb-6">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start shopping to see your orders here
          </p>
          <Link href="/products">
            <Button>
              <ShoppingBag className="h-4 w-4 mr-2" /> Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {order.orderNumber}
                    </span>
                    <Badge className={STATUS_COLORS[order.status]}>
                      {order.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item: any, i: number) =>
                      item.product?.images?.[0]?.url ? (
                        <img
                          key={i}
                          src={item.product.images[0].url}
                          alt=""
                          className="w-10 h-10 rounded-lg border-2 border-white object-cover"
                        />
                      ) : (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center"
                        >
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                      )
                    )}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-sm text-gray-500">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      incl. ${order.serviceFee.toFixed(2)} fee
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
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
            onClick={() => setPage(p => p + 1)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
