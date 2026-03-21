'use client';

import React from 'react';
import { useSellerRevenue } from '../../../../hooks/useOrders';
import { Skeleton } from '../../../../components/ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  Package,
  Percent,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';

export default function SellerRevenuePage() {
  const { data, isLoading } = useSellerRevenue();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] p-6 lg:p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
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
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Your Earnings (80%)',
      value: `$${revenue.totalEarned.toFixed(2)}`,
      subtitle: 'After platform fee',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Platform Fee (20%)',
      value: `$${revenue.totalPlatformFee.toFixed(2)}`,
      subtitle: 'Service fee deducted',
      icon: Percent,
      gradient: 'from-orange-500 to-amber-500',
      bgLight: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Items Sold',
      value: revenue.totalItemsSold.toString(),
      subtitle: `${revenue.totalOrders} order items`,
      icon: Package,
      gradient: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const maxSales = Math.max(...revenue.chartData.map((d: any) => d.sales), 1);
  const earningsPercent =
    revenue.totalSales > 0
      ? (revenue.totalEarned / revenue.totalSales) * 100
      : 0;
  const feePercent =
    revenue.totalSales > 0
      ? (revenue.totalPlatformFee / revenue.totalSales) * 100
      : 0;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-Poppins">
          Revenue
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Track your sales performance and earnings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
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
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-[10px] text-gray-400 mt-1">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-50">
          <h3 className="text-base font-semibold text-gray-900">
            Earnings Breakdown
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            How your revenue is split
          </p>
        </div>
        <div className="p-5 space-y-5">
          {/* Visual Split Bar */}
          <div className="relative h-4 rounded-full overflow-hidden bg-gray-100">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-l-full transition-all duration-700"
              style={{ width: `${earningsPercent}%` }}
            />
            <div
              className="absolute inset-y-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-r-full transition-all duration-700"
              style={{ left: `${earningsPercent}%`, width: `${feePercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Your Earnings */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-gray-600">
                  Your Earnings (80%)
                </span>
              </div>
              <p className="text-xl font-bold text-emerald-700">
                ${revenue.totalEarned.toFixed(2)}
              </p>
              <div className="mt-2 w-full bg-emerald-100 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${earningsPercent}%` }}
                />
              </div>
            </div>

            {/* Platform Fee */}
            <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <span className="text-xs font-medium text-gray-600">
                  Platform Fee (20%)
                </span>
              </div>
              <p className="text-xl font-bold text-orange-700">
                ${revenue.totalPlatformFee.toFixed(2)}
              </p>
              <div className="mt-2 w-full bg-orange-100 rounded-full h-1.5">
                <div
                  className="bg-orange-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${feePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Sales Over Time
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Your daily sales performance
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-indigo-400 to-purple-400" />
                <span>Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-emerald-400 to-teal-400" />
                <span>Earnings</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-5">
          {revenue.chartData.length > 0 ? (
            <div className="space-y-3">
              {/* Chart Bars */}
              <div className="flex items-end gap-1.5 h-52">
                {revenue.chartData.map((entry: any, index: number) => {
                  const height = (entry.sales / maxSales) * 180;
                  return (
                    <div
                      key={entry.date}
                      className="flex-1 flex flex-col items-center justify-end gap-1.5 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          ${entry.earned.toFixed(0)}
                        </span>
                      </div>
                      {/* Bar */}
                      <div
                        className="w-full relative rounded-t-md overflow-hidden"
                        style={{ height: `${Math.max(height, 4)}px` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500 to-purple-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500 to-emerald-400 opacity-90"
                          style={{
                            height: `${entry.sales > 0 ? (entry.earned / entry.sales) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Date Labels */}
              <div className="flex gap-1.5">
                {revenue.chartData.map((entry: any) => (
                  <div key={entry.date} className="flex-1 text-center">
                    <span className="text-[9px] text-gray-400 font-medium">
                      {new Date(entry.date).toLocaleDateString('en', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-14">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-7 w-7 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                No sales data yet
              </p>
              <p className="text-xs text-gray-400">
                Revenue will appear here once you get orders
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
