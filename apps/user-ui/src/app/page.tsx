'use client';

import React from 'react';
import Link from 'next/link';
import { useFeaturedProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/products/ProductCard';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { PRODUCT_CATEGORIES } from '../types/product';
import { ArrowRight, ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: '💻',
  'Clothing & Fashion': '👕',
  'Home & Garden': '🏡',
  'Sports & Outdoors': '⚽',
  'Books & Media': '📚',
  'Toys & Games': '🎮',
  'Health & Beauty': '💄',
  Automotive: '🚗',
  'Food & Beverages': '🍕',
  'Jewelry & Accessories': '💍',
  'Art & Crafts': '🎨',
  'Pet Supplies': '🐾',
  Other: '📦',
};

export default function HomePage() {
  const { data, isLoading } = useFeaturedProducts(8);

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="w-[90%] max-w-7xl mx-auto py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold font-Poppins mb-4 leading-tight">
              Discover Products from Top Sellers
            </h1>
            <p className="text-blue-100 text-lg mb-8">
              Shop from thousands of vendors with the best deals on electronics, fashion, home goods and more.
            </p>
            <div className="flex gap-3">
              <Link href="/products">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Shop Now
                </Button>
              </Link>
              <Link href="/become-seller">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-b bg-gray-50">
        <div className="w-[90%] max-w-7xl mx-auto py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, label: 'Free Shipping', desc: 'On orders over $50' },
              { icon: Shield, label: 'Secure Payment', desc: '100% secure checkout' },
              { icon: Headphones, label: '24/7 Support', desc: 'Dedicated support' },
              { icon: ShoppingBag, label: 'Easy Returns', desc: '30-day return policy' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shop by Category */}
      <div className="w-[90%] max-w-7xl mx-auto py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-Poppins">Shop by Category</h2>
          <Link href="/products" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
          {PRODUCT_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-white hover:shadow-md hover:border-blue-200 transition-all text-center group"
            >
              <span className="text-2xl">{CATEGORY_ICONS[category] || '📦'}</span>
              <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 leading-tight">
                {category}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-gray-50 py-12">
        <div className="w-[90%] max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-Poppins">Featured Products</h2>
            <Link href="/products" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ))}
            </div>
          ) : data?.products && data.products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Products coming soon! Check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
