'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Star, Loader2 } from 'lucide-react';
import { useCreateOrderReview } from '../../hooks/useReviews';

interface OrderReviewFormProps {
  orderId: string;
  sellerId: string;
  sellerName: string;
}

export const OrderReviewForm: React.FC<OrderReviewFormProps> = ({
  orderId,
  sellerId,
  sellerName,
}) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const create = useCreateOrderReview(orderId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (rating < 1) {
      setError('Please choose a rating');
      return;
    }
    if (comment.trim().length < 3) {
      setError('Please write a short comment');
      return;
    }
    try {
      await create.mutateAsync({ sellerId, rating, comment: comment.trim() });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to submit review. Try again.'
      );
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 bg-gray-50 rounded-lg p-4">
      <p className="text-sm font-medium text-gray-700">
        Review {sellerName}
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(n)}
            className="p-1"
            aria-label={`Rate ${n} stars`}
          >
            <Star
              className={`h-6 w-6 ${
                (hovered || rating) >= n
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
        placeholder="What did you think of this seller?"
        rows={3}
        className="w-full border rounded-md px-3 py-2 text-sm"
      />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
          {error}
        </div>
      )}
      <Button
        type="submit"
        size="sm"
        disabled={create.isPending}
      >
        {create.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit review'
        )}
      </Button>
    </form>
  );
};
