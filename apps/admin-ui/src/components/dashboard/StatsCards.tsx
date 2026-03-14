'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { DashboardStats } from '../../types';
import { DollarSign, Package, ShoppingCart, Users, Store, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Platform Fees (20%)',
      value: `$${stats.totalPlatformFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders.toString(),
      icon: CheckCircle,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Active Sellers',
      value: stats.totalSellers.toString(),
      icon: Store,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Total Customers',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'bg-pink-100 text-pink-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
