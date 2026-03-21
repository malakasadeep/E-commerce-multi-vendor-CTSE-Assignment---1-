'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export const useAdminOrders = (page = 1, limit = 10, status?: string) => {
  return useQuery({
    queryKey: ['admin-orders', page, limit, status],
    queryFn: async () => {
      let url = `/order-api/admin/orders?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      const res = await axiosInstance.get(url);
      return res.data;
    },
    staleTime: 1 * 60 * 1000,
  });
};

export const useAdminOrderDetail = (id: string) => {
  return useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order-api/admin/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await axiosInstance.put(
        `/order-api/admin/orders/${id}/status`,
        { status }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order'] });
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/order-api/admin/stats');
      return res.data.stats;
    },
    staleTime: 1 * 60 * 1000,
  });
};
