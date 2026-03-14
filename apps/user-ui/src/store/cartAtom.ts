'use client';

import { atom } from 'jotai';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  sellerId: string;
  shopId: string;
  shopName: string;
  stock: number;
}

// Initialize from localStorage
const getInitialCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('eshop-cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const baseCartAtom = atom<CartItem[]>(getInitialCart());

// Wrapper atom that syncs to localStorage
export const cartAtom = atom(
  (get) => get(baseCartAtom),
  (get, set, newCart: CartItem[]) => {
    set(baseCartAtom, newCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eshop-cart', JSON.stringify(newCart));
    }
  }
);

// Derived atom for cart count
export const cartCountAtom = atom((get) => {
  const cart = get(cartAtom);
  return cart.reduce((sum, item) => sum + item.quantity, 0);
});

// Derived atom for cart total
export const cartTotalAtom = atom((get) => {
  const cart = get(cartAtom);
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
});
