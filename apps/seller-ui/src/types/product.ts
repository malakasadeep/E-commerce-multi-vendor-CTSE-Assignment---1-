export interface ProductImage {
  id: string;
  url: string;
  file_id?: string;
}

export interface ProductShop {
  id: string;
  name: string;
  category: string;
  address: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  tags: string[];
  stock: number;
  images: ProductImage[];
  sellerId: string;
  shopId: string;
  shop: ProductShop;
  ratings: number;
  sold_out: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  tags: string[];
  stock: number;
  images: { url: string }[];
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing & Fashion',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Media',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Food & Beverages',
  'Jewelry & Accessories',
  'Art & Crafts',
  'Pet Supplies',
  'Other',
] as const;
