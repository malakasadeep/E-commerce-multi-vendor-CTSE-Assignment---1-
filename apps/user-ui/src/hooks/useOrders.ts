'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { items: any[]; shippingAddress: any }) => {
      const res = await axiosInstance.post('/order-api/orders', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    },
  });
};

export const useUserOrders = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['user-orders', page, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/order-api/orders?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    staleTime: 1 * 60 * 1000,
  });
};

export const useOrderDetail = (id: string) => {
  return useQuery({
    queryKey: ['user-order', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order-api/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};
