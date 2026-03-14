'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export function useSellerOrders(page = 1, limit = 10, status?: string) {
  return useQuery({
    queryKey: ['seller-orders', page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) params.set('status', status);
      const { data } = await axiosInstance.get(`/order-api/seller/orders?${params}`);
      return data;
    },
    staleTime: 30 * 1000,
  });
}

export function useUpdateOrderItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      itemId,
      status,
    }: {
      orderId: string;
      itemId: string;
      status: string;
    }) => {
      const { data } = await axiosInstance.put(
        `/order-api/seller/orders/${orderId}/items/${itemId}/status`,
        { status }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['seller-revenue'] });
    },
  });
}

export function useSellerRevenue() {
  return useQuery({
    queryKey: ['seller-revenue'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/order-api/seller/revenue');
      return data;
    },
    staleTime: 60 * 1000,
  });
}
