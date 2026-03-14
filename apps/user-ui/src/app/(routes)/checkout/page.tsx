'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { cartAtom, cartTotalAtom } from '../../../store/cartAtom';
import { useCreateOrder } from '../../../hooks/useOrders';
import { useCreatePaymentIntent } from '../../../hooks/usePayment';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ShoppingBag, CreditCard, CheckCircle } from 'lucide-react';
import useUser from '../../../hooks/useUser';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [cart, setCart] = useAtom(cartAtom);
  const [cartTotal] = useAtom(cartTotalAtom);
  const createOrder = useCreateOrder();
  const createPayment = useCreatePaymentIntent();

  const [step, setStep] = useState<'shipping' | 'processing' | 'success'>('shipping');
  const [error, setError] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const serviceFee = Math.round(cartTotal * 0.20 * 100) / 100;
  const total = Math.round((cartTotal + serviceFee) * 100) / 100;

  if (!userLoading && !user) {
    router.replace('/login');
    return null;
  }

  if (cart.length === 0 && step !== 'success') {
    router.replace('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.street || !address.city || !address.country) {
      setError('Please fill in all required address fields');
      return;
    }

    setStep('processing');

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: address,
      };

      const result = await createOrder.mutateAsync(orderData);

      // Try to create payment intent
      try {
        await createPayment.mutateAsync(result.order.id);
      } catch (payErr) {
        // Payment intent creation is optional (Stripe might not be configured)
        console.log('Payment intent creation skipped:', payErr);
      }

      // Clear cart on success
      setCart([]);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setStep('shipping');
    }
  };

  if (step === 'success') {
    return (
      <div className="w-[90%] max-w-2xl mx-auto py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-500 mb-6">Thank you for your purchase. You can track your order in the orders section.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push('/orders')}>View My Orders</Button>
          <Button variant="outline" onClick={() => router.push('/products')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[90%] max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 font-Poppins mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Street Address *</label>
                  <Input
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">City *</label>
                    <Input
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">State</label>
                    <Input
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="NY"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ZIP Code</label>
                    <Input
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Country *</label>
                    <Input
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
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
              disabled={step === 'processing'}
            >
              {step === 'processing' ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Place Order - ${total.toFixed(2)}
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-xl border p-6 h-fit sticky top-4">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-gray-300" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
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
