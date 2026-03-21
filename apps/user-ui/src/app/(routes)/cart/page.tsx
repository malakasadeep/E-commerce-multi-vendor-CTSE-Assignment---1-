'use client';

import React from 'react';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { cartAtom, cartTotalAtom } from '../../../store/cartAtom';
import { Button } from '../../../components/ui/button';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';
import useUser from '../../../hooks/useUser';

export default function CartPage() {
  const [cart, setCart] = useAtom(cartAtom);
  const [cartTotal] = useAtom(cartTotalAtom);
  const { user } = useUser();

  const serviceFee = Math.round(cartTotal * 0.2 * 100) / 100;
  const total = Math.round((cartTotal + serviceFee) * 100) / 100;

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart.map(item => {
        if (item.productId === productId) {
          const newQty = Math.max(
            1,
            Math.min(item.stock, item.quantity + delta)
          );
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  if (cart.length === 0) {
    return (
      <div className="w-[90%] max-w-7xl mx-auto py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-6">
          Browse products and add them to your cart
        </p>
        <Link href="/products">
          <Button>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-[90%] max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-Poppins">
          Shopping Cart ({cart.length} items)
        </h1>
        <Button variant="ghost" className="text-red-600" onClick={clearCart}>
          <Trash2 className="h-4 w-4 mr-2" /> Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div
              key={item.productId}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-gray-300" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.shopName}</p>
                <p className="font-semibold text-blue-600 mt-1">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, -1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, 1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border p-6 h-fit sticky top-4">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service Fee (20%)</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          {user ? (
            <Link href="/checkout">
              <Button className="w-full mt-6" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="w-full mt-6" size="lg">
                Login to Checkout
              </Button>
            </Link>
          )}
          <Link href="/products">
            <Button variant="outline" className="w-full mt-3" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
