'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { Admin } from '../types';

const useAdmin = () => {
  const {
    data: admin,
    isLoading,
    isError,
    refetch,
  } = useQuery<Admin>({
    queryKey: ['admin'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/logged-in-admin');
      return res.data.admin;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return { admin, isLoading, isError, refetch };
};

export default useAdmin;
