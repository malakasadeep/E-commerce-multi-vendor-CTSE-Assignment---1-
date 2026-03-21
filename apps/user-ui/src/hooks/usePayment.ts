'use client';

import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await axiosInstance.post(
        '/payment-api/create-payment-intent',
        { orderId }
      );
      return res.data;
    },
  });
};
