'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export const useAdminReviews = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['admin-reviews', page, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(`/review-api/admin/reviews?page=${page}&limit=${limit}`);
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'order' | 'product' }) => {
      const res = await axiosInstance.delete(`/review-api/admin/reviews/${id}?type=${type}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });
};
