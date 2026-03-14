'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAdminOrderDetail, useUpdateOrderStatus } from '../../../../../hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { ArrowLeft, Package, User, MapPin, CreditCard } from 'lucide-react';
import { STATUS_COLORS } from '../../../../../types';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useAdminOrderDetail(id);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const order = data?.order;
  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link href="/dashboard/orders">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-500 text-sm">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <Badge className={`${STATUS_COLORS[order.status]} text-sm px-3 py-1`}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" /> Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{order.user?.name}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{order.shippingAddress?.street}</p>
            <p className="text-sm">{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
            {order.shippingAddress?.zip && <p className="text-sm">{order.shippingAddress.zip}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">${order.total.toFixed(2)}</p>
            <p className="text-sm text-gray-500">
              {order.payment ? (
                <Badge className={STATUS_COLORS[order.payment.status]}>{order.payment.status}</Badge>
              ) : 'Awaiting payment'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                {item.productImage ? (
                  <img src={item.productImage} alt="" className="w-14 h-14 rounded object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded bg-gray-200 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="text-green-600">Platform: ${item.platformFee.toFixed(2)}</span>
                    <span className="mx-1">|</span>
                    <span>Seller: ${item.sellerAmount.toFixed(2)}</span>
                  </div>
                </div>
                <Badge className={STATUS_COLORS[item.status]}>{item.status}</Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">Service Fee (20%)</span>
              <span className="text-green-600 font-medium">${order.serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {order.status === 'pending' && (
          <Button onClick={() => updateStatus.mutate({ id: order.id, status: 'confirmed' })}>
            Confirm Order
          </Button>
        )}
        {!['cancelled', 'delivered', 'refunded'].includes(order.status) && (
          <Button
            variant="destructive"
            onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}
          >
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
}
