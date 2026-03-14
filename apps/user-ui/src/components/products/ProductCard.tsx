'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Star, ImageIcon } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images?.[0] ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-300" />
            </div>
          )}
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500">
              {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% OFF
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-gray-500 mb-1">{product.shop?.name}</p>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(product.ratings)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              ({product.ratings > 0 ? product.ratings.toFixed(1) : '0'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-red-600">
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
