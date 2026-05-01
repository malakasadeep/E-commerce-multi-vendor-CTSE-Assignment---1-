'use client';

import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreatePaymentIntent,
  usePaymentStatus,
} from '../../hooks/usePayment';
import { Button } from '../ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { StripePaymentForm } from './StripePaymentForm';

interface PayUnpaidOrderProps {
  orderId: string;
  totalLabel: string;
}

export const PayUnpaidOrder: React.FC<PayUnpaidOrderProps> = ({
  orderId,
  totalLabel,
}) => {
  const queryClient = useQueryClient();
  const createPayment = useCreatePaymentIntent();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const { data: paymentStatus } = usePaymentStatus(paymentId, confirming);

  useEffect(() => {
    if (!confirming || !paymentStatus?.payment) return;
    if (paymentStatus.payment.status === 'succeeded') {
      setConfirming(false);
      queryClient.invalidateQueries({ queryKey: ['user-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    } else if (paymentStatus.payment.status === 'failed') {
      setError('Payment failed. Please try again.');
      setConfirming(false);
    }
  }, [paymentStatus, confirming, queryClient, orderId]);

  const handleStart = async () => {
    setError('');
    try {
      const res = await createPayment.mutateAsync(orderId);
      setClientSecret(res.clientSecret);
      setPaymentId(res.paymentId);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to start payment. Please try again.'
      );
    }
  };

  if (!clientSecret) {
    return (
      <div className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}
        <Button onClick={handleStart} disabled={createPayment.isPending}>
          {createPayment.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Complete payment
            </>
          )}
        </Button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Confirming payment with Stripe...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
      <StripePaymentForm
        clientSecret={clientSecret}
        totalLabel={totalLabel}
        onPaying={() => {
          setError('');
          setConfirming(true);
        }}
        onError={msg => setError(msg)}
      />
    </div>
  );
};
