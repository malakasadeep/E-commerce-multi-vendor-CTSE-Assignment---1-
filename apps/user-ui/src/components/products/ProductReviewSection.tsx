'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/button';
import { useCreateReview } from '../../hooks/useProducts';
import useUser from '../../hooks/useUser';
import { ProductReview } from '../../types/product';

interface ProductReviewSectionProps {
  productId: string;
  reviews: ProductReview[];
}

export function ProductReviewSection({
  productId,
  reviews,
}: ProductReviewSectionProps) {
  const { user } = useUser();
  const createReview = useCreateReview();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const hasReviewed = reviews.some(r => r.userId === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }
    setError('');
    createReview.mutate(
      { productId, rating: selectedRating, comment },
      {
        onSuccess: () => {
          setComment('');
          setSelectedRating(0);
        },
        onError: (err: any) => {
          setError(err?.response?.data?.message || 'Failed to submit review');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Customer Reviews ({reviews.length})
      </h3>

      {/* Review Form */}
      {user && !hasReviewed && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-lg p-4 space-y-3"
        >
          <p className="font-medium text-sm">Write a Review</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedRating(i + 1)}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`h-6 w-6 cursor-pointer transition-colors ${
                    i < (hoverRating || selectedRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={createReview.isPending} size="sm">
            {createReview.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      )}

      {!user && (
        <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
          Please{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            login
          </a>{' '}
          to write a review.
        </p>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">
                    {review.user.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
