'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export const useCustomers = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['admin-customers', page, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/admin/customers?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useCustomerDetail = (id: string) => {
  return useQuery({
    queryKey: ['admin-customer', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/admin/customers/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};
