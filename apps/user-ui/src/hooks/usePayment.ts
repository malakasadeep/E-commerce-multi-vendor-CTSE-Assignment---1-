'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentId: string;
}

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: async (orderId: string): Promise<PaymentIntentResponse> => {
      const res = await axiosInstance.post(
        '/payment-api/create-payment-intent',
        { orderId }
      );
      return res.data;
    },
  });
};

export interface PaymentStatusResponse {
  success: boolean;
  payment: {
    id: string;
    stripePaymentId: string;
    status: 'pending' | 'succeeded' | 'failed' | 'refunded';
    amount: number;
    currency: string;
    orders: { id: string; orderNumber: string; status: string }[];
  };
}

export const usePaymentStatus = (paymentId: string | null, enabled = true) => {
  return useQuery<PaymentStatusResponse>({
    queryKey: ['payment-status', paymentId],
    enabled: !!paymentId && enabled,
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/payment-api/payments/${paymentId}?_t=${Date.now()}`,
        { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } }
      );
      return res.data;
    },
    refetchInterval: query => {
      const status = query.state.data?.payment?.status;
      if (status === 'succeeded' || status === 'failed' || status === 'refunded') {
        return false;
      }
      return 2000;
    },
    staleTime: 0,
    gcTime: 0,
  });
};
