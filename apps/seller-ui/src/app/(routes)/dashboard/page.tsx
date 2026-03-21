'use client';
import React from 'react';
import Link from 'next/link';
import useSeller from '../../../hooks/useSeller';
import { useSellerRevenue, useSellerOrders } from '../../../hooks/useOrders';
import { Badge } from '../../../components/ui/badge';
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  Store,
  MapPin,
  Tag,
  Plus,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
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
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12.5%',
    },
    {
      title: 'Your Earnings',
      value: revenue ? `$${revenue.totalEarned.toFixed(2)}` : '$0.00',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: '+8.2%',
    },
    {
      title: 'Items Sold',
      value: revenue ? revenue.totalItemsSold.toString() : '0',
      icon: Package,
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
      iconColor: 'text-amber-600',
      change: '+5.1%',
    },
    {
      title: 'Order Items',
      value: revenue ? revenue.totalOrders.toString() : '0',
      icon: ShoppingBag,
      gradient: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+3.7%',
    },
  ];

  const quickActions = [
    {
      label: 'Create Product',
      href: '/dashboard/products/create',
      icon: Plus,
      gradient: 'from-indigo-500 to-purple-600',
      description: 'Add a new product to your store',
    },
    {
      label: 'View Orders',
      href: '/dashboard/orders',
      icon: ShoppingBag,
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Manage and track your orders',
    },
    {
      label: 'View Revenue',
      href: '/dashboard/revenue',
      icon: TrendingUp,
      gradient: 'from-amber-500 to-orange-500',
      description: 'Track your sales and earnings',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-Poppins">
              Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, {isLoading ? '...' : seller?.name || 'Seller'}!
              Here&apos;s what&apos;s happening with your store.
            </p>
          </div>
          <Link
            href="/dashboard/products/create"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`${stat.bgLight} p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  {stat.change}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Recent Orders
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Latest order activity
              </p>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4">
            {recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.order?.user?.name || 'Customer'} &middot; Qty:{' '}
                        {item.quantity}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-emerald-600">
                        ${item.sellerAmount.toFixed(2)}
                      </p>
                      <Badge
                        className={`text-[10px] border ${STATUS_COLORS[item.status] || 'bg-gray-50 text-gray-600'}`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  No orders yet
                </p>
                <p className="text-xs text-gray-400">
                  Orders will appear here once customers purchase your products
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">
              Quick Actions
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Common tasks</p>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-400">
                      {action.description}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shop Info */}
      {seller?.shop && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">
              Shop Information
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Your store details</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Store className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">
                    Shop Name
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {seller.shop.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">
                    Address
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {seller.shop.address}
                  </p>
                </div>
              </div>
              {seller.shop.category && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">
                      Category
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {seller.shop.category}
                    </p>
                  </div>
                </div>
              )}
              {seller.shop.bio && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">
                      Description
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {seller.shop.bio}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashBoard;
