'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { CreditCard, Loader2 } from 'lucide-react';

let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

interface PayButtonProps {
  onPaying: () => void;
  onError: (msg: string) => void;
  totalLabel: string;
}

const PayButton: React.FC<PayButtonProps> = ({ onPaying, onError, totalLabel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    onPaying();

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setSubmitting(false);
      return;
    }
    // On success, the parent polls payment status until the webhook confirms.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || !elements || submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay {totalLabel}
          </>
        )}
      </Button>
    </form>
  );
};

interface StripePaymentFormProps {
  clientSecret: string;
  onPaying: () => void;
  onError: (msg: string) => void;
  totalLabel: string;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  onPaying,
  onError,
  totalLabel,
}) => {
  const [stripeReady, setStripeReady] = useState<Stripe | null>(null);
  const [missingKey, setMissingKey] = useState(false);

  useEffect(() => {
    getStripe().then(s => {
      if (!s) {
        setMissingKey(true);
        return;
      }
      setStripeReady(s);
    });
  }, []);

  if (missingKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
        Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in
        the user-ui environment to enable card payments.
      </div>
    );
  }

  if (!stripeReady) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading payment form...
      </div>
    );
  }

  return (
    <Elements stripe={stripeReady} options={{ clientSecret }}>
      <PayButton onPaying={onPaying} onError={onError} totalLabel={totalLabel} />
    </Elements>
  );
};
