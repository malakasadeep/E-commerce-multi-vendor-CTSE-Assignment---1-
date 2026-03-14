import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  Store,
} from 'lucide-react';

export const SIDEBAR_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Sellers', href: '/dashboard/sellers', icon: Store },
  { title: 'Products', href: '/dashboard/products', icon: Package },
  { title: 'Customers', href: '/dashboard/customers', icon: Users },
  { title: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { title: 'Revenue', href: '/dashboard/revenue', icon: DollarSign },
  { title: 'Reviews', href: '/dashboard/reviews', icon: Star },
];
