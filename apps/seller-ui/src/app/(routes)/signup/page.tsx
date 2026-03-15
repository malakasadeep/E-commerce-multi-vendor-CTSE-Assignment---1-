"use client";

import { useMutation } from '@tanstack/react-query';
import {
  Eye,
  EyeOff,
  Store,
  CheckCircle,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  Globe,
  MapPin,
  Clock,
  Link2,
  FileText,
  CreditCard,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';

type SellerFormData = {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  country: string;
};

type ShopFormData = {
  name: string;
  bio: string;
  address: string;
  openingHours: string;
  website: string;
  category: string;
};

const SHOP_CATEGORIES = [
  'Electronics',
  'Fashion & Apparel',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Outdoors',
  'Books & Stationery',
  'Food & Beverages',
  'Toys & Games',
  'Automotive',
  'Art & Crafts',
  'Jewelry & Accessories',
  'Other',
];

function SignUpPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [sellerData, setSellerData] = useState<SellerFormData | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const sellerForm = useForm<SellerFormData>();
  const shopForm = useForm<ShopFormData>();

  const startResendTimer = useCallback(() => {
    setCanResend(false);
    setTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const signupMutation = useMutation({
    mutationFn: async (data: SellerFormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller-registration`,
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      setServerError(null);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Registration failed. Please try again.';
      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) throw new Error('No seller data');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify-seller`,
        { ...sellerData, otp: otp.join('') },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.seller?.id) setSellerId(data.seller.id);
      setServerError(null);
      setActiveStep(2);
      setShowOtp(false);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'OTP verification failed.';
      setServerError(errorMessage);
    },
  });

  const createShopMutation = useMutation({
    mutationFn: async (data: ShopFormData) => {
      if (!sellerId) throw new Error('Seller ID not found');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create-shop`,
        { ...data, sellerId },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      setServerError(null);
      setActiveStep(3);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Shop creation failed. Please try again.';
      setServerError(errorMessage);
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (!sellerData || !canResend) return;
    setServerError(null);
    signupMutation.mutate(sellerData);
  };

  const handleConnectStripe = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create-stripe-link`,
        { sellerId }
      );
      if (response.data.url) window.location.href = response.data.url;
    } catch (error) {
      console.log('Stripe error: ', error);
    }
  };

  const stepData = [
    { label: 'Create Account', icon: User },
    { label: 'Setup Shop', icon: Store },
    { label: 'Complete', icon: CheckCircle },
  ];

  const inputClass = (hasError: boolean) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 outline-none ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
        : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-Poppins text-gradient">
              Eshop Seller
            </span>
          </Link>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {stepData.map((step, idx) => {
            const StepIcon = step.icon;
            const stepNum = idx + 1;
            return (
              <React.Fragment key={stepNum}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold transition-all duration-300 shadow-md ${
                      stepNum < activeStep
                        ? 'bg-green-500 text-white'
                        : stepNum === activeStep
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white ring-4 ring-indigo-200'
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {stepNum < activeStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-2 font-medium transition-colors ${
                      stepNum <= activeStep ? 'text-indigo-700' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`w-16 sm:w-24 h-1 rounded-full mx-2 mb-5 transition-all duration-500 ${
                      stepNum < activeStep
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          {/* STEP 1: Account */}
          {activeStep === 1 && (
            <>
              {!showOtp ? (
                <div className="animate-fade-in">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 font-Poppins mb-1">
                      Create Seller Account
                    </h1>
                    <p className="text-gray-500 text-sm">
                      Already have an account?{' '}
                      <Link
                        href="/login"
                        className="text-indigo-600 font-semibold hover:text-indigo-700"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>

                  <form
                    onSubmit={sellerForm.handleSubmit((data) => {
                      setServerError(null);
                      signupMutation.mutate(data);
                    })}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full name
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className={inputClass(
                            !!sellerForm.formState.errors.name
                          )}
                          {...sellerForm.register('name', {
                            required: 'Name is required',
                          })}
                        />
                      </div>
                      {sellerForm.formState.errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {sellerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email address
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          placeholder="seller@example.com"
                          className={inputClass(
                            !!sellerForm.formState.errors.email
                          )}
                          {...sellerForm.register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Invalid email address',
                            },
                          })}
                        />
                      </div>
                      {sellerForm.formState.errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {sellerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type={passwordVisible ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          className={inputClass(
                            !!sellerForm.formState.errors.password
                          )}
                          {...sellerForm.register('password', {
                            required: 'Password is required',
                            minLength: {
                              value: 6,
                              message: 'Must be at least 6 characters',
                            },
                          })}
                        />
                        <button
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          type="button"
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {passwordVisible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {sellerForm.formState.errors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {sellerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Phone
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <Phone className="h-4 w-4" />
                          </div>
                          <input
                            type="tel"
                            placeholder="+1 234 567"
                            className={inputClass(
                              !!sellerForm.formState.errors.phone_number
                            )}
                            {...sellerForm.register('phone_number', {
                              required: 'Required',
                            })}
                          />
                        </div>
                        {sellerForm.formState.errors.phone_number && (
                          <p className="text-red-500 text-xs mt-1">
                            {sellerForm.formState.errors.phone_number.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Country
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <Globe className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            placeholder="Sri Lanka"
                            className={inputClass(
                              !!sellerForm.formState.errors.country
                            )}
                            {...sellerForm.register('country', {
                              required: 'Required',
                            })}
                          />
                        </div>
                        {sellerForm.formState.errors.country && (
                          <p className="text-red-500 text-xs mt-1">
                            {sellerForm.formState.errors.country.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {serverError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                        {serverError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={signupMutation.isPending}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-60"
                    >
                      {signupMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* OTP */
                <div className="animate-fade-in">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 font-Poppins mb-2">
                      Verify your email
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Code sent to{' '}
                      <span className="font-semibold text-gray-700">
                        {sellerData?.email}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        ref={(el) => {
                          if (el) inputRefs.current[index] = el;
                        }}
                        maxLength={1}
                        className="w-14 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      />
                    ))}
                  </div>

                  {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                      {serverError}
                    </div>
                  )}

                  <button
                    disabled={
                      verifyOtpMutation.isPending || otp.join('').length < 4
                    }
                    onClick={() => verifyOtpMutation.mutate()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-60 mb-4"
                  >
                    {verifyOtpMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    {canResend ? (
                      <button
                        onClick={resendOtp}
                        disabled={signupMutation.isPending}
                        className="text-indigo-600 font-semibold hover:text-indigo-700"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <span>
                        Resend in{' '}
                        <span className="font-semibold text-gray-700">
                          {timer}s
                        </span>
                      </span>
                    )}
                  </p>

                  <button
                    onClick={() => {
                      setShowOtp(false);
                      setServerError(null);
                      setOtp(['', '', '', '']);
                    }}
                    className="w-full mt-4 text-gray-500 text-sm flex items-center justify-center gap-1.5 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to registration
                  </button>
                </div>
              )}
            </>
          )}

          {/* STEP 2: Shop */}
          {activeStep === 2 && (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <Store className="h-8 w-8 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 font-Poppins mb-1">
                  Setup Your Shop
                </h1>
                <p className="text-gray-500 text-sm">
                  Tell us about your business
                </p>
              </div>

              <form
                onSubmit={shopForm.handleSubmit((data) => {
                  setServerError(null);
                  createShopMutation.mutate(data);
                })}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Shop name *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Store className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="My Awesome Store"
                      className={inputClass(!!shopForm.formState.errors.name)}
                      {...shopForm.register('name', {
                        required: 'Shop name is required',
                      })}
                    />
                  </div>
                  {shopForm.formState.errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {shopForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white"
                    {...shopForm.register('category', {
                      required: 'Category is required',
                    })}
                  >
                    <option value="">Select a category</option>
                    {SHOP_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {shopForm.formState.errors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {shopForm.formState.errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 text-gray-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Tell customers about your shop..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                      {...shopForm.register('bio', {
                        required: 'Description is required',
                      })}
                    />
                  </div>
                  {shopForm.formState.errors.bio && (
                    <p className="text-red-500 text-xs mt-1">
                      {shopForm.formState.errors.bio.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="123 Main St, City"
                      className={inputClass(
                        !!shopForm.formState.errors.address
                      )}
                      {...shopForm.register('address', {
                        required: 'Address is required',
                      })}
                    />
                  </div>
                  {shopForm.formState.errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {shopForm.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Opening hours
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="9AM-6PM"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        {...shopForm.register('openingHours')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Website
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <Link2 className="h-4 w-4" />
                      </div>
                      <input
                        type="url"
                        placeholder="https://..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        {...shopForm.register('website')}
                      />
                    </div>
                  </div>
                </div>

                {serverError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                    {serverError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createShopMutation.isPending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-60"
                >
                  {createShopMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Shop...
                    </>
                  ) : (
                    <>
                      Create Shop
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Stripe */}
          {activeStep === 3 && (
            <div className="text-center py-4 animate-fade-in">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 font-Poppins mb-2">
                Almost done!
              </h2>
              <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
                Connect your Stripe account to start receiving payments from
                customers securely.
              </p>
              <button
                onClick={handleConnectStripe}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 mb-3"
              >
                <CreditCard className="h-4 w-4" />
                Connect Stripe Account
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full text-gray-500 text-sm py-2.5 hover:text-gray-700 transition-colors"
              >
                Skip for now &rarr; Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
