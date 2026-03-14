'use client';

import React from 'react';
import { useSellerRevenue } from '../../../../hooks/useOrders';
import { Card, CardContent } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';
import { DollarSign, TrendingUp, Package, Percent } from 'lucide-react';

export default function SellerRevenuePage() {
  const { data, isLoading } = useSellerRevenue();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const revenue = data?.revenue || {
    totalSales: 0,
    totalEarned: 0,
    totalPlatformFee: 0,
    totalItemsSold: 0,
    totalOrders: 0,
    chartData: [],
  };

  const stats = [
    {
      title: 'Total Sales',
      value: `$${revenue.totalSales.toFixed(2)}`,
      subtitle: 'Gross sales amount',
      icon: DollarSign,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Your Earnings (80%)',
      value: `$${revenue.totalEarned.toFixed(2)}`,
      subtitle: 'After platform fee',
      icon: TrendingUp,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
    },
    {
      title: 'Platform Fee (20%)',
      value: `$${revenue.totalPlatformFee.toFixed(2)}`,
      subtitle: 'Service fee deducted',
      icon: Percent,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
    },
    {
      title: 'Items Sold',
      value: revenue.totalItemsSold.toString(),
      subtitle: `${revenue.totalOrders} order items`,
      icon: Package,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
    },
  ];

  const maxSales = Math.max(...revenue.chartData.map((d: any) => d.sales), 1);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
        <p className="text-gray-500 text-sm mt-1">Track your sales and earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.bgLight} p-2.5 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Earnings Breakdown */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Your Earnings (80%)</span>
                <span className="font-medium text-green-600">${revenue.totalEarned.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: revenue.totalSales > 0 ? `${(revenue.totalEarned / revenue.totalSales) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Platform Fee (20%)</span>
                <span className="font-medium text-orange-600">${revenue.totalPlatformFee.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-orange-400 h-3 rounded-full transition-all"
                  style={{ width: revenue.totalSales > 0 ? `${(revenue.totalPlatformFee / revenue.totalSales) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Chart */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Sales Over Time</h3>
          {revenue.chartData.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-end gap-1 h-48">
                {revenue.chartData.map((entry: any) => (
                  <div
                    key={entry.date}
                    className="flex-1 flex flex-col items-center justify-end gap-1"
                  >
                    <span className="text-xs text-gray-500 font-medium">
                      ${entry.earned.toFixed(0)}
                    </span>
                    <div
                      className="w-full bg-green-400 rounded-t-sm min-h-[4px] transition-all"
                      style={{ height: `${(entry.sales / maxSales) * 160}px` }}
                      title={`Sales: $${entry.sales.toFixed(2)} | Earned: $${entry.earned.toFixed(2)}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {revenue.chartData.map((entry: any) => (
                  <div key={entry.date} className="flex-1 text-center">
                    <span className="text-[10px] text-gray-400">
                      {new Date(entry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-400 rounded-sm" />
                  <span>Sales (Your 80% shown above bars)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No sales data yet</p>
              <p className="text-sm text-gray-400 mt-1">Revenue will appear here once you get orders</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
