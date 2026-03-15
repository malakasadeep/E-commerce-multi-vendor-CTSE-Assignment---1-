"use client";
import React from 'react';
import Link from 'next/link';
import useSeller from '../../../hooks/useSeller';
import { useSellerRevenue, useSellerOrders } from '../../../hooks/useOrders';
import { Badge } from '../../../components/ui/badge';
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function DashBoard() {
  const { seller, isLoading } = useSeller();
  const { data: revenueData } = useSellerRevenue();
  const { data: ordersData } = useSellerOrders(1, 5);

  const revenue = revenueData?.revenue;
  const recentOrders = ordersData?.orderItems || [];

  const stats = [
    {
      title: 'Total Sales',
      value: revenue ? `$${revenue.totalSales.toFixed(2)}` : '$0.00',
      icon: DollarSign,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Your Earnings',
      value: revenue ? `$${revenue.totalEarned.toFixed(2)}` : '$0.00',
      icon: TrendingUp,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
    },
    {
      title: 'Items Sold',
      value: revenue ? revenue.totalItemsSold.toString() : '0',
      icon: Package,
      color: 'bg-yellow-500',
      bgLight: 'bg-yellow-50',
    },
    {
      title: 'Order Items',
      value: revenue ? revenue.totalOrders.toString() : '0',
      icon: ShoppingBag,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {isLoading ? '...' : seller?.name || 'Seller'}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgLight} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {item.product?.images?.[0]?.url ? (
                    <img src={item.product.images[0].url} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                      <Package className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">
                      {item.order?.user?.name || 'Customer'} · Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">${item.sellerAmount.toFixed(2)}</p>
                    <Badge className={`text-[10px] ${STATUS_COLORS[item.status] || 'bg-gray-100'}`}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No orders yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/products/create" className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-left flex items-center gap-3">
              <Package className="w-5 h-5" />
              Create New Product
            </Link>
            <Link href="/dashboard/orders" className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-left flex items-center gap-3">
              <ShoppingBag className="w-5 h-5" />
              View Orders
            </Link>
            <Link href="/dashboard/revenue" className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-left flex items-center gap-3">
              <TrendingUp className="w-5 h-5" />
              View Revenue
            </Link>
          </div>
        </div>
      </div>

      {/* Shop Info */}
      {seller?.shop && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shop Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Shop Name</p>
              <p className="font-medium text-gray-900">{seller.shop.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium text-gray-900">{seller.shop.address}</p>
            </div>
            {seller.shop.category && (
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium text-gray-900">{seller.shop.category}</p>
              </div>
            )}
            {seller.shop.bio && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium text-gray-900">{seller.shop.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashBoard;
