'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { Product, CreateProductInput, ProductsResponse } from '../types/product';

export function useSellerProducts(page = 1, limit = 12) {
  return useQuery<ProductsResponse>({
    queryKey: ['seller-products', page, limit],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/product-api/seller/products?page=${page}&limit=${limit}`
      );
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

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productData: CreateProductInput) => {
      const { data } = await axiosInstance.post('/product-api/products', productData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...productData }: CreateProductInput & { id: string }) => {
      const { data } = await axiosInstance.put(`/product-api/products/${id}`, productData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/product-api/products/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    },
  });
}
