'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export const useAdminProducts = (page = 1, limit = 10, category?: string) => {
  return useQuery({
    queryKey: ['admin-products', page, limit, category],
    queryFn: async () => {
      let url = `/product-api/products?page=${page}&limit=${limit}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      const res = await axiosInstance.get(url);
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};
