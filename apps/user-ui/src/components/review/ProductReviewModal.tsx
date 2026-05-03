'use client';

import React, { useState } from 'react';
import { Star, Loader2, X, Check, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { useCreateReview } from '../../hooks/useProducts';

interface ProductLine {
  productId: string;
  productName: string;
  productImage?: string | null;
}

interface ProductReviewModalProps {
  open: boolean;
  onClose: () => void;
  products: ProductLine[];
}

interface DraftReview {
  rating: number;
  comment: string;
  submitted: boolean;
  error?: string;
}

export const ProductReviewModal: React.FC<ProductReviewModalProps> = ({
  open,
  onClose,
  products,
}) => {
  const createReview = useCreateReview();
  const [drafts, setDrafts] = useState<Record<string, DraftReview>>(() =>
    products.reduce((acc, p) => {
      acc[p.productId] = { rating: 0, comment: '', submitted: false };
      return acc;
    }, {} as Record<string, DraftReview>)
  );

  if (!open) return null;

  const updateDraft = (productId: string, patch: Partial<DraftReview>) => {
    setDrafts(prev => ({
      ...prev,
      [productId]: { ...prev[productId], ...patch },
    }));
  };

  const handleSubmit = async (productId: string) => {
    const draft = drafts[productId];
    if (!draft || draft.submitted) return;

    if (draft.rating < 1) {
      updateDraft(productId, { error: 'Please choose a rating' });
      return;
    }
    if (draft.comment.trim().length < 3) {
      updateDraft(productId, { error: 'Please write a short comment' });
      return;
    }

    updateDraft(productId, { error: undefined });

    try {
      await createReview.mutateAsync({
        productId,
        rating: draft.rating,
        comment: draft.comment.trim(),
      });
      updateDraft(productId, { submitted: true });
    } catch (err: any) {
      updateDraft(productId, {
        error:
          err?.response?.data?.message ||
          'Failed to submit review. Please try again.',
      });
    }
  };

  const allSubmitted = products.every(p => drafts[p.productId]?.submitted);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Review your products
            </h2>
            <p className="text-sm text-gray-500">
              Share your experience to help other shoppers
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {products.map(product => {
            const draft = drafts[product.productId];
            if (!draft) return null;

            if (draft.submitted) {
              return (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3"
                >
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm text-green-800">
                    Review submitted for {product.productName}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={product.productId}
                className="border border-gray-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  {product.productImage ? (
                    <img
                      src={product.productImage}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <p className="font-medium text-gray-900">
                    {product.productName}
                  </p>
                </div>

                <RatingStars
                  value={draft.rating}
                  onChange={r => updateDraft(product.productId, { rating: r })}
                />

                <textarea
                  value={draft.comment}
                  onChange={e =>
                    updateDraft(product.productId, { comment: e.target.value })
                  }
                  rows={3}
                  placeholder="What did you think of this product?"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {draft.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
                    {draft.error}
                  </div>
                )}

                <Button
                  size="sm"
                  onClick={() => handleSubmit(product.productId)}
                  disabled={createReview.isPending}
                >
                  {createReview.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit review'
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {allSubmitted ? 'Done' : 'Skip for now'}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface RatingStarsProps {
  value: number;
  onChange: (n: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} stars`}
          className="p-0.5"
        >
          <Star
            className={`h-6 w-6 ${
              (hovered || value) >= n
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};
