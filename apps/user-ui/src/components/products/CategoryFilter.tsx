'use client';

import React from 'react';
import { Button } from '../ui/button';
import { PRODUCT_CATEGORIES } from '../../types/product';

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === '' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect('')}
      >
        All
      </Button>
      {PRODUCT_CATEGORIES.map(category => (
        <Button
          key={category}
          variant={selected === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
