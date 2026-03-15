'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Star, ImageIcon, ShoppingCart } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group cursor-pointer overflow-hidden border-gray-100 hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-300 h-full rounded-2xl">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.images?.[0] ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-200" />
            </div>
          )}
          {hasDiscount && (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
              {Math.round(
                ((product.price - product.discountPrice!) / product.price) * 100
              )}
              % OFF
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-semibold text-sm bg-black/50 px-4 py-2 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
          {/* Quick action on hover */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="text-[11px] text-gray-400 mb-1 font-medium uppercase tracking-wider">
            {product.shop?.name}
          </p>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.round(product.ratings)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-200'
                }`}
              />
            ))}
            <span className="text-xs text-gray-400 ml-1">
              ({product.ratings > 0 ? product.ratings.toFixed(1) : '0'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-blue-600">
                  ${product.discountPrice!.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
