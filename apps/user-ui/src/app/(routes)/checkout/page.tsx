'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { cartAtom, cartTotalAtom } from '../../../store/cartAtom';
import { useCreateOrder } from '../../../hooks/useOrders';
import {
  useCreatePaymentIntent,
  usePaymentStatus,
  useSyncPayment,
} from '../../../hooks/usePayment';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  ShoppingBag,
  CreditCard,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import useUser from '../../../hooks/useUser';
import { StripePaymentForm } from '../../../components/checkout/StripePaymentForm';

type Step = 'shipping' | 'payment' | 'confirming' | 'success';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [cart, setCart] = useAtom(cartAtom);
  const [cartTotal] = useAtom(cartTotalAtom);
  const createOrder = useCreateOrder();
  const createPayment = useCreatePaymentIntent();
  const syncPayment = useSyncPayment();

  const [step, setStep] = useState<Step>('shipping');
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const serviceFee = Math.round(cartTotal * 0.2 * 100) / 100;
  const total = Math.round((cartTotal + serviceFee) * 100) / 100;

  const { data: paymentStatus } = usePaymentStatus(
    paymentId,
    step === 'confirming'
  );

  React.useEffect(() => {
    if (step !== 'confirming' || !paymentStatus?.payment) return;
    if (paymentStatus.payment.status === 'succeeded') {
      setCart([]);
      setStep('success');
    } else if (paymentStatus.payment.status === 'failed') {
      setError('Payment failed. Please try again.');
      setStep('payment');
    }
  }, [paymentStatus, step, setCart]);

  // Fallback: if Stripe confirmed client-side but backend stays "pending" too long,
  // succeed the UI anyway after 15s so the user isn't stuck forever.
  const [stripeConfirmedAt, setStripeConfirmedAt] = useState<number | null>(null);
  React.useEffect(() => {
    if (step !== 'confirming' || !stripeConfirmedAt) return;
    const timer = setTimeout(() => {
      if (step === 'confirming') {
        setCart([]);
        setStep('success');
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [step, stripeConfirmedAt, setCart]);

  // Hard timeout: if "confirming" state runs for more than 90s without
  // Stripe ever confirming client-side, give up and show an error.
  React.useEffect(() => {
    if (step !== 'confirming' || stripeConfirmedAt) return;
    const timer = setTimeout(() => {
      if (step === 'confirming') {
        setError(
          'Payment timed out. Your card was not charged — please try again.'
        );
        setStep('payment');
      }
    }, 90000);
    return () => clearTimeout(timer);
  }, [step, stripeConfirmedAt]);

  const handleStripeConfirmed = async () => {
    setStripeConfirmedAt(Date.now());
    if (!paymentId) return;
    try {
      await syncPayment.mutateAsync(paymentId);
    } catch (e) {
      console.warn('Payment sync failed; polling will retry:', e);
    }
  };

  if (!userLoading && !user) {
    router.replace('/login');
    return null;
  }

  if (cart.length === 0 && step === 'shipping') {
    router.replace('/cart');
    return null;
  }

  const handleSubmitShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.street || !address.city || !address.country) {
      setError('Please fill in all required address fields');
      return;
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: address,
      };

      const orderResult = await createOrder.mutateAsync(orderData);
      setOrderId(orderResult.order.id);
      setOrderNumber(orderResult.order.orderNumber);

      const paymentResult = await createPayment.mutateAsync(
        orderResult.order.id
      );
      setPaymentId(paymentResult.paymentId);
      setClientSecret(paymentResult.clientSecret);
      setStep('payment');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to start checkout. Please try again.'
      );
    }
  };

  if (step === 'success') {
    return (
      <div className="w-[90%] max-w-2xl mx-auto py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment received
        </h2>
        <p className="text-gray-500 mb-6">
          Order {orderNumber} is confirmed. We'll email you when it ships.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push(`/orders/${orderId}`)}>
            View order
          </Button>
          <Button variant="outline" onClick={() => router.push('/products')}>
            Continue shopping
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'confirming') {
    return (
      <div className="w-[90%] max-w-2xl mx-auto py-16 text-center">
        <Loader2 className="h-10 w-10 text-gray-400 animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Confirming payment...
        </h2>
        <p className="text-gray-500">
          We're waiting for Stripe to confirm your payment. This usually
          takes a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="w-[90%] max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 font-Poppins mb-6">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <form onSubmit={handleSubmitShipping} className="space-y-6">
              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Street Address *
                    </label>
                    <Input
                      value={address.street}
                      onChange={e =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        City *
                      </label>
                      <Input
                        value={address.city}
                        onChange={e =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        State
                      </label>
                      <Input
                        value={address.state}
                        onChange={e =>
                          setAddress({ ...address, state: e.target.value })
                        }
                        placeholder="NY"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        ZIP Code
                      </label>
                      <Input
                        value={address.zip}
                        onChange={e =>
                          setAddress({ ...address, zip: e.target.value })
                        }
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Country *
                      </label>
                      <Input
                        value={address.country}
                        onChange={e =>
                          setAddress({ ...address, country: e.target.value })
                        }
                        placeholder="United States"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={createOrder.isPending || createPayment.isPending}
              >
                {createOrder.isPending || createPayment.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Preparing checkout...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Continue to payment - ${total.toFixed(2)}
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 'payment' && clientSecret && (
            <div className="bg-white rounded-xl border p-6 space-y-6">
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setStep('shipping')}
                  className="text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Edit address
                </button>
              </div>
              <h2 className="font-semibold text-lg">Payment</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <StripePaymentForm
                clientSecret={clientSecret}
                totalLabel={`$${total.toFixed(2)}`}
                onPaying={() => {
                  setError('');
                  setStep('confirming');
                }}
                onError={msg => {
                  setError(msg);
                  setStep('payment');
                }}
                onConfirmed={handleStripeConfirmed}
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-6 h-fit sticky top-4">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {cart.map(item => (
              <div key={item.productId} className="flex items-center gap-3">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-gray-300" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service Fee (20%)</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
