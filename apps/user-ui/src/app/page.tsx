'use client';

import React from 'react';
import Link from 'next/link';
import { useFeaturedProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/products/ProductCard';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { PRODUCT_CATEGORIES } from '../types/product';
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  Shield,
  Headphones,
  RotateCcw,
  Monitor,
  Shirt,
  Home,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Sparkles,
  Car,
  UtensilsCrossed,
  Gem,
  Palette,
  PawPrint,
  Package,
  Store,
  TrendingUp,
  Users,
  Star,
  Zap,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Electronics: Monitor,
  'Clothing & Fashion': Shirt,
  'Home & Garden': Home,
  'Sports & Outdoors': Dumbbell,
  'Books & Media': BookOpen,
  'Toys & Games': Gamepad2,
  'Health & Beauty': Sparkles,
  Automotive: Car,
  'Food & Beverages': UtensilsCrossed,
  'Jewelry & Accessories': Gem,
  'Art & Crafts': Palette,
  'Pet Supplies': PawPrint,
  Other: Package,
};

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: 'from-blue-500 to-blue-600',
  'Clothing & Fashion': 'from-pink-500 to-rose-600',
  'Home & Garden': 'from-green-500 to-emerald-600',
  'Sports & Outdoors': 'from-orange-500 to-amber-600',
  'Books & Media': 'from-purple-500 to-violet-600',
  'Toys & Games': 'from-red-500 to-rose-600',
  'Health & Beauty': 'from-teal-500 to-cyan-600',
  Automotive: 'from-slate-500 to-gray-600',
  'Food & Beverages': 'from-yellow-500 to-orange-600',
  'Jewelry & Accessories': 'from-fuchsia-500 to-pink-600',
  'Art & Crafts': 'from-indigo-500 to-blue-600',
  'Pet Supplies': 'from-lime-500 to-green-600',
  Other: 'from-gray-500 to-slate-600',
};

export default function HomePage() {
  const { data, isLoading } = useFeaturedProducts(8);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-[90%] max-w-7xl mx-auto py-20 md:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>New arrivals every day</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-Poppins mb-6 leading-tight">
                Discover the Best
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                  Products & Deals
                </span>
              </h1>
              <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
                Shop from thousands of trusted sellers with amazing deals on
                electronics, fashion, home goods and more.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-base px-8 py-6 rounded-xl shadow-lg shadow-black/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Shop Now
                  </Button>
                </Link>
                <Link href="/become-seller">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 py-6 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Store className="h-5 w-5 mr-2" />
                    Become a Seller
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
                {[
                  { value: '10K+', label: 'Products', icon: Package },
                  { value: '5K+', label: 'Sellers', icon: Users },
                  { value: '50K+', label: 'Happy Customers', icon: Star },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-blue-200">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Right - Decorative */}
            <div className="hidden lg:flex justify-center animate-fade-in animation-delay-300">
              <div className="relative">
                <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float">
                  <ShoppingBag className="h-32 w-32 text-white/20" />
                </div>
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-2xl bg-amber-400/90 flex items-center justify-center shadow-xl animate-bounce-gentle">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-2xl bg-green-400/90 flex items-center justify-center shadow-xl animate-bounce-gentle animation-delay-500">
                  <Shield className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b bg-white">
        <div className="w-[90%] max-w-7xl mx-auto py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger-children">
            {[
              {
                icon: Truck,
                label: 'Free Shipping',
                desc: 'On orders over $50',
                color: 'text-blue-600 bg-blue-50',
              },
              {
                icon: Shield,
                label: 'Secure Payment',
                desc: '100% secure checkout',
                color: 'text-green-600 bg-green-50',
              },
              {
                icon: Headphones,
                label: '24/7 Support',
                desc: 'Dedicated support',
                color: 'text-purple-600 bg-purple-50',
              },
              {
                icon: RotateCcw,
                label: 'Easy Returns',
                desc: '30-day return policy',
                color: 'text-orange-600 bg-orange-50',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 p-4 rounded-2xl hover:shadow-md hover:bg-gray-50/50 transition-all duration-300 group cursor-default"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="w-[90%] max-w-7xl mx-auto py-14">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Browse</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-Poppins">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1.5 hover:gap-2.5 transition-all duration-200"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 stagger-children">
          {PRODUCT_CATEGORIES.map((category) => {
            const IconComp = CATEGORY_ICONS[category] || Package;
            const gradient = CATEGORY_COLORS[category] || 'from-gray-500 to-slate-600';
            return (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:border-transparent hover:-translate-y-1 transition-all duration-300 text-center group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                >
                  <IconComp className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 leading-tight">
                  {category}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50/80 py-14">
        <div className="w-[90%] max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">
                Trending
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-Poppins">
                Featured Products
              </h2>
            </div>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1.5 hover:gap-2.5 transition-all duration-200"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-3 space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ))}
            </div>
          ) : data?.products && data.products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 stagger-children">
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No products yet
              </h3>
              <p className="text-gray-500 text-sm">
                Products coming soon! Check back later.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Become a Seller CTA */}
      <section className="w-[90%] max-w-7xl mx-auto py-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-10 md:p-14">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
          </div>
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-Poppins mb-4">
                Start Selling Today
              </h2>
              <p className="text-purple-100 text-lg mb-6 leading-relaxed">
                Join thousands of sellers on Eshop and reach millions of
                customers. Set up your store in minutes and start growing your
                business.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/become-seller">
                  <Button
                    size="lg"
                    className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Store className="h-5 w-5 mr-2" />
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'Free', label: 'Store Setup', icon: Store },
                  { value: '0%', label: 'Listing Fee', icon: Package },
                  { value: '24/7', label: 'Seller Support', icon: Headphones },
                  { value: 'Fast', label: 'Payments', icon: Zap },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center"
                  >
                    <item.icon className="h-6 w-6 text-amber-300 mx-auto mb-2" />
                    <p className="text-xl font-bold text-white">{item.value}</p>
                    <p className="text-xs text-purple-200">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
