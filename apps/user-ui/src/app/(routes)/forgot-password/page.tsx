'use client';

import { Mail, ShoppingBag, ArrowLeft, KeyRound } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  email: string;
};

function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSubmittedEmail(data.email);
    setSubmitted(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12 px-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[440px] animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-Poppins text-gradient">
              Eshop
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          {!submitted ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="h-8 w-8 text-amber-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 font-Poppins mb-2">
                  Forgot your password?
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  No worries! Enter your email address and we&apos;ll send you a
                  link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                    htmlFor="email"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 outline-none ${
                        errors.email
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                      }`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 font-Poppins mb-2">
                Check your email
              </h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                We&apos;ve sent a password reset link to{' '}
                <span className="font-semibold text-gray-700">
                  {submittedEmail}
                </span>
                . Please check your inbox.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
              >
                Didn&apos;t receive it? Try again
              </button>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
