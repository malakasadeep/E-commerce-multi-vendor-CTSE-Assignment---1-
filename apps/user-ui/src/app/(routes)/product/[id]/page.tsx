'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { useProduct } from '../../../../hooks/useProducts';
import { ProductReviewSection } from '../../../../components/products/ProductReviewSection';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import { cartAtom, CartItem } from '../../../../store/cartAtom';
import {
  Star,
  ShoppingCart,
  Heart,
  ArrowLeft,
  Store,
  MapPin,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useProduct(id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cart, setCart] = useAtom(cartAtom);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const existingCartItem = cart.find((item) => item.productId === id);

  const handleAddToCart = () => {
    if (!data?.product) return;
    const product = data.product;
    const effectivePrice = product.discountPrice && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

    if (existingCartItem) {
      const newQty = Math.min(product.stock, existingCartItem.quantity + quantity);
      setCart(cart.map((item) =>
        item.productId === id ? { ...item, quantity: newQty } : item
      ));
    } else {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: effectivePrice,
        quantity,
        image: product.images?.[0]?.url || null,
        sellerId: product.sellerId,
        shopId: product.shop?.id || '',
        shopName: product.shop?.name || '',
        stock: product.stock,
      };
      setCart([...cart, newItem]);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="w-[90%] max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="w-[90%] max-w-7xl mx-auto py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Product not found</h2>
        <Link href="/products">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const product = data.product;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const images = product.images || [];
  const reviews = product.reviews || [];

  return (
    <div className="w-[90%] max-w-7xl mx-auto py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/products" className="hover:text-blue-600 transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border">
            {images.length > 0 ? (
              <img
                src={images[selectedImageIndex]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-20 w-20 text-gray-300" />
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImageIndex((i) => (i > 0 ? i - 1 : images.length - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setSelectedImageIndex((i) => (i < images.length - 1 ? i + 1 : 0))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    i === selectedImageIndex ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          <div>
            <Badge variant="secondary" className="mb-2">{product.category}</Badge>
            <h1 className="text-2xl font-bold text-gray-900 font-Poppins">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.ratings)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.ratings > 0 ? product.ratings.toFixed(1) : '0'} ({reviews.length} reviews)
            </span>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-500">{product.sold_out} sold</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-bold text-red-600">
                  ${product.discountPrice!.toFixed(2)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                  {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% OFF
                </Badge>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity Selector + Action Buttons */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <span className="text-sm font-medium text-gray-700">Qty:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 rounded-l-lg"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 rounded-r-lg"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {existingCartItem && (
                <span className="text-xs text-gray-500">({existingCartItem.quantity} in cart)</span>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <Button
              className="flex-1"
              size="lg"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              {addedToCart ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {existingCartItem ? 'Update Cart' : 'Add to Cart'}
                </>
              )}
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Shop Info */}
          {product.shop && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Store className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{product.shop.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {product.shop.address}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-8">
        <ProductReviewSection productId={product.id} reviews={reviews} />
      </div>
    </div>
  );
}
