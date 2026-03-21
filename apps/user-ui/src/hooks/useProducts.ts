'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { Product, ProductsResponse } from '../types/product';

export function useProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}) {
  const { page = 1, limit = 12, category, search } = params || {};

  let url = '/product-api/products';
  if (search) {
    url = `/product-api/products/search?q=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
  } else if (category) {
    url = `/product-api/products/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`;
  } else {
    url = `/product-api/products?page=${page}&limit=${limit}`;
  }

  return useQuery<ProductsResponse>({
    queryKey: ['products', { page, limit, category, search }],
    queryFn: async () => {
      const { data } = await axiosInstance.get(url);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery<{ success: boolean; product: Product }>({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/product-api/products/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery<ProductsResponse>({
    queryKey: ['featured-products', limit],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/product-api/products?page=1&limit=${limit}`
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      rating,
      comment,
    }: {
      productId: string;
      rating: number;
      comment: string;
    }) => {
      const { data } = await axiosInstance.post(
        `/product-api/products/${productId}/reviews`,
        { rating, comment }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['product', variables.productId],
      });
    },
  });
}
