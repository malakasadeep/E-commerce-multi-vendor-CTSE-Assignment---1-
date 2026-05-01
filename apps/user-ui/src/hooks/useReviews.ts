'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export interface OrderReview {
  id: string;
  userId: string;
  orderId: string;
  sellerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { id: string; name: string };
}

export const useOrderReviews = (orderId: string, enabled = true) => {
  return useQuery<{ success: boolean; reviews: OrderReview[] }>({
    queryKey: ['order-reviews', orderId],
    enabled: !!orderId && enabled,
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/review-api/orders/${orderId}/review`
      );
      return res.data;
    },
  });
};

export const useCreateOrderReview = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      sellerId: string;
      rating: number;
      comment: string;
    }) => {
      const res = await axiosInstance.post(
        `/review-api/orders/${orderId}/review`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-reviews', orderId] });
    },
  });
};
