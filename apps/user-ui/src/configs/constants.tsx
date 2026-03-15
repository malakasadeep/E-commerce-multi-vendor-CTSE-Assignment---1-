export interface NavItemTypes {
  title: string;
  href: string;
  external?: boolean;
}

export const SELLER_URL =
  process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3001';

export const NAV_ITEMS: NavItemTypes[] = [
  { title: 'Home', href: '/' },
  { title: 'Products', href: '/products' },
  { title: 'Offers', href: '/offers' },
  { title: 'Become a Seller', href: SELLER_URL, external: true },
];
