'use client';

import React, { useState } from 'react';
import { useAdminReviews, useDeleteReview } from '../../../../hooks/useReviews';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Star, Trash2 } from 'lucide-react';

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminReviews(page, 20);
  const deleteReview = useDeleteReview();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const orderReviews = data?.orderReviews || [];
  const productReviews = data?.productReviews || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          {(data?.pagination?.orderReviewTotal || 0) +
            (data?.pagination?.productReviewTotal || 0)}{' '}
          total reviews
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Product Reviews ({data?.pagination?.productReviewTotal || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {productReviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productReviews.map((review: any) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.product?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{review.user?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.round(review.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs ml-1">{review.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm">
                      {review.comment}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() =>
                          deleteReview.mutate({
                            id: review.id,
                            type: 'product',
                          })
                        }
                        disabled={deleteReview.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No product reviews yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Order Reviews ({data?.pagination?.orderReviewTotal || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orderReviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderReviews.map((review: any) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.user?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.round(review.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs ml-1">{review.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm">
                      {review.comment}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() =>
                          deleteReview.mutate({ id: review.id, type: 'order' })
                        }
                        disabled={deleteReview.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No order reviews yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
