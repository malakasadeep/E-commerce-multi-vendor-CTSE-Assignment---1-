'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export const useRevenue = (period = 'all') => {
  return useQuery({
    queryKey: ['admin-revenue', period],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order-api/admin/revenue?period=${period}`);
      return res.data.revenue;
    },
    staleTime: 2 * 60 * 1000,
  });
};
