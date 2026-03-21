export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  country: string;
  stripeId?: string;
  shop?: Shop;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: string;
  name: string;
  bio?: string;
  category: string;
  address: string;
  ratings: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  tags: string[];
  stock: number;
  images: ProductImage[];
  sellerId: string;
  shopId: string;
  shop?: Shop;
  ratings: number;
  sold_out: number;
  createdAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: { id: string; name: string; email: string };
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  status: string;
  shippingAddress: any;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  sellerAmount: number;
  platformFee: number;
  status: string;
  product?: Product;
}

export interface Payment {
  id: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface Revenue {
  totalRevenue: number;
  totalPlatformFees: number;
  totalSellerPayouts: number;
  orderCount: number;
  chartData: {
    date: string;
    total: number;
    platformFee: number;
    sellerPayout: number;
  }[];
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalRevenue: number;
  totalPlatformFees: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};
