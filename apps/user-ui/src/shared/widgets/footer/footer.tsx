'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowRight,
  CreditCard,
  Shield,
  Truck,
} from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="w-[90%] max-w-7xl mx-auto py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg font-Poppins">
                Subscribe to our Newsletter
              </h3>
              <p className="text-blue-100 text-sm">
                Get updates on new products and exclusive deals
              </p>
            </div>
          </div>
          <div className="flex w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-[320px] px-4 py-3 rounded-l-lg text-gray-900 text-sm focus:outline-none"
            />
            <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-r-lg transition-colors flex items-center gap-2">
              Subscribe
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="w-[90%] max-w-7xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white font-Poppins">
                Eshop
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your one-stop marketplace for quality products from trusted
              sellers worldwide. Shop with confidence.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-Poppins">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Products', href: '/products' },
                { label: 'My Orders', href: '/orders' },
                { label: 'Shopping Cart', href: '/cart' },
                { label: 'Become a Seller', href: '/become-seller' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-2"
                  >
                    <ArrowRight className="h-3 w-3 text-blue-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-Poppins">
              Support
            </h4>
            <ul className="space-y-2.5">
              {[
                'Help Center',
                'Returns & Refunds',
                'Shipping Policy',
                'Terms of Service',
                'Privacy Policy',
              ].map((item) => (
                <li key={item}>
                  <span className="text-sm hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-2 cursor-pointer">
                    <ArrowRight className="h-3 w-3 text-blue-400" />
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-Poppins">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  123 Commerce Street, Colombo 07, Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm">+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm">support@eshop.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="w-[90%] max-w-7xl mx-auto py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Eshop. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CreditCard className="h-4 w-4" />
              <span>Visa / Mastercard</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Truck className="h-4 w-4" />
              <span>Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
