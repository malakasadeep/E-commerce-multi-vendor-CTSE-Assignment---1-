'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export const useSellers = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['admin-sellers', page, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/admin/sellers?page=${page}&limit=${limit}`);
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useSellerDetail = (id: string) => {
  return useQuery({
    queryKey: ['admin-seller', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/admin/sellers/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};
