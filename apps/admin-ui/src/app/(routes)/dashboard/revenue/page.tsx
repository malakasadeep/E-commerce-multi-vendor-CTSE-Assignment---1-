'use client';

import React, { useState } from 'react';
import { useRevenue } from '../../../../hooks/useRevenue';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { DollarSign, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

export default function RevenuePage() {
  const [period, setPeriod] = useState('all');
  const { data: revenue, isLoading } = useRevenue(period);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Revenue Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Platform revenue and fee breakdown
          </p>
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month', 'all'].map(p => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === 'all'
                ? 'All Time'
                : p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold mt-1">
                  $
                  {revenue?.totalRevenue?.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  }) || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Platform Fees (20%)
                </p>
                <p className="text-3xl font-bold mt-1 text-green-600">
                  $
                  {revenue?.totalPlatformFees?.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  }) || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Seller Payouts (80%)
                </p>
                <p className="text-3xl font-bold mt-1">
                  $
                  {revenue?.totalSellerPayouts?.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  }) || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Orders
                </p>
                <p className="text-3xl font-bold mt-1">
                  {revenue?.orderCount || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {revenue?.chartData && revenue.chartData.length > 0 ? (
            <div className="space-y-3">
              {revenue.chartData.map((entry: any) => (
                <div
                  key={entry.date}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-24 text-sm font-medium text-gray-700">
                    {entry.date}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.max(5, (entry.total / Math.max(...revenue.chartData.map((d: any) => d.total))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      ${entry.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600">
                      Fee: ${entry.platformFee.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">
              No revenue data for this period
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
