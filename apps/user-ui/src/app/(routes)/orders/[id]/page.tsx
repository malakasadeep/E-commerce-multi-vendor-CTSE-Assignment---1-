'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrderDetail } from '../../../../hooks/useOrders';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const STATUS_TIMELINE = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useOrderDetail(id);

  if (isLoading) {
    return (
      <div className="w-[90%] max-w-5xl mx-auto py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const order = data?.order;
  if (!order) {
    return (
      <div className="w-[90%] max-w-5xl mx-auto py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Order not found
        </h2>
        <Link href="/orders">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const isCancelled =
    order.status === 'cancelled' || order.status === 'refunded';
  const currentStep = STATUS_TIMELINE.indexOf(order.status);

  return (
    <div className="w-[90%] max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge
          className={`ml-auto ${STATUS_COLORS[order.status]} text-sm px-3 py-1`}
        >
          {order.status}
        </Badge>
      </div>

      {/* Order Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between">
            {STATUS_TIMELINE.map((status, i) => {
              const isCompleted = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <React.Fragment key={status}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      } ${isCurrent ? 'ring-2 ring-green-400' : ''}`}
                    >
                      {status === 'pending' && <Clock className="h-5 w-5" />}
                      {status === 'confirmed' && (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      {status === 'processing' && (
                        <Package className="h-5 w-5" />
                      )}
                      {status === 'shipped' && <Truck className="h-5 w-5" />}
                      {status === 'delivered' && (
                        <CheckCircle className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  {i < STATUS_TIMELINE.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${i < currentStep ? 'bg-green-400' : 'bg-gray-200'}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex items-center gap-3">
          <XCircle className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-medium text-red-800">Order {order.status}</p>
            <p className="text-sm text-red-600">
              This order has been {order.status}.
            </p>
          </div>
        </div>
      )}

      {/* Shipping & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Shipping Address</h3>
          </div>
          <p className="text-sm text-gray-600">
            {order.shippingAddress?.street}
          </p>
          <p className="text-sm text-gray-600">
            {order.shippingAddress?.city}, {order.shippingAddress?.state || ''}
          </p>
          <p className="text-sm text-gray-600">
            {order.shippingAddress?.zip} {order.shippingAddress?.country}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Payment</h3>
          </div>
          <p className="text-sm text-gray-600">
            Status:{' '}
            {order.payment ? (
              <Badge
                className={STATUS_COLORS[order.payment.status] || 'bg-gray-100'}
              >
                {order.payment.status}
              </Badge>
            ) : (
              'Awaiting payment'
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Amount: ${order.total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              {item.product?.images?.[0]?.url ? (
                <img
                  src={item.product.images[0].url}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} x ${item.price.toFixed(2)}
                </p>
                {item.product?.shop?.name && (
                  <p className="text-xs text-gray-400">
                    from {item.product.shop.name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <Badge
                  className={`mt-1 ${STATUS_COLORS[item.status] || 'bg-gray-100'}`}
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service Fee (20%)</span>
            <span>${order.serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
