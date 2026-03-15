'use client';

import React from 'react';
import { Button } from '../../../components/ui/button';
import {
  Store,
  TrendingUp,
  Users,
  Shield,
  Headphones,
  Package,
  Zap,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Globe,
  CreditCard,
} from 'lucide-react';

const SELLER_URL = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3001';

export default function BecomeSellerPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-[90%] max-w-7xl mx-auto py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Join 5,000+ successful sellers</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-Poppins mb-6 leading-tight">
              Start Your Business
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                on Eshop Today
              </span>
            </h1>
            <p className="text-purple-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Reach millions of customers, manage your inventory effortlessly,
              and grow your business with our powerful seller tools.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={SELLER_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-base px-10 py-6 rounded-xl shadow-lg shadow-black/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Store className="h-5 w-5 mr-2" />
                  Open Your Store
                </Button>
              </a>
              <a href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-base px-10 py-6 rounded-xl transition-all duration-300"
                >
                  Learn More
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="w-[90%] max-w-7xl mx-auto py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 stagger-children">
            {[
              { value: '50K+', label: 'Active Buyers', icon: Users },
              { value: '10K+', label: 'Products Listed', icon: Package },
              { value: '95%', label: 'Seller Satisfaction', icon: TrendingUp },
              { value: '$2M+', label: 'Monthly Sales', icon: BarChart3 },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 font-Poppins">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50/80">
        <div className="w-[90%] max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-indigo-600 mb-2">
              Why Sell on Eshop?
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-Poppins">
              Everything you need to succeed
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              {
                icon: Globe,
                title: 'Reach Millions',
                desc: 'Access our growing customer base and expand your market reach instantly.',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: CreditCard,
                title: 'Secure Payments',
                desc: 'Get paid quickly and securely with our trusted payment processing.',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                desc: 'Track your sales, revenue, and customer insights with real-time analytics.',
                color: 'from-purple-500 to-violet-500',
              },
              {
                icon: Package,
                title: 'Easy Inventory',
                desc: 'Manage your products, stock, and orders from a single dashboard.',
                color: 'from-orange-500 to-amber-500',
              },
              {
                icon: Headphones,
                title: '24/7 Seller Support',
                desc: 'Our dedicated team is always ready to help you grow your business.',
                color: 'from-pink-500 to-rose-500',
              },
              {
                icon: Shield,
                title: 'Seller Protection',
                desc: 'Comprehensive policies to protect you from fraud and disputes.',
                color: 'from-indigo-500 to-blue-500',
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16">
        <div className="w-[90%] max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-indigo-600 mb-2">
              Getting Started
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-Poppins">
              Start selling in 3 easy steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              {
                step: '01',
                title: 'Create Your Account',
                desc: 'Sign up for a seller account in minutes. It is completely free with no hidden charges.',
              },
              {
                step: '02',
                title: 'Set Up Your Store',
                desc: 'Add your products, set prices, and customize your store profile to attract buyers.',
              },
              {
                step: '03',
                title: 'Start Earning',
                desc: 'Receive orders from customers, ship products, and get paid securely into your account.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-300">
                    <span className="text-3xl font-bold text-gradient">
                      {item.step}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="w-[90%] max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-10 md:p-16 text-center">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-Poppins mb-4">
                Ready to get started?
              </h2>
              <p className="text-purple-100 text-lg mb-8 max-w-xl mx-auto">
                Join Eshop today and turn your products into a thriving online
                business.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href={SELLER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-base px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Store className="h-5 w-5 mr-2" />
                    Start Selling Now
                  </Button>
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-purple-200">
                {[
                  'Free to start',
                  'No listing fees',
                  'Cancel anytime',
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
