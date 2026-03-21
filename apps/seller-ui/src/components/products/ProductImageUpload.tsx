'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Plus, ImageIcon } from 'lucide-react';

interface ProductImageUploadProps {
  images: { url: string }[];
  onChange: (images: { url: string }[]) => void;
}

export function ProductImageUpload({
  images,
  onChange,
}: ProductImageUploadProps) {
  const [urlInput, setUrlInput] = useState('');

  const addImage = () => {
    if (urlInput.trim()) {
      onChange([...images, { url: urlInput.trim() }]);
      setUrlInput('');
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addImage();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Paste image URL..."
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addImage}
          disabled={!urlInput.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border bg-gray-50 aspect-square"
            >
              <img
                src={img.url}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (
                    e.target as HTMLImageElement
                  ).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden absolute inset-0 flex items-center justify-center text-gray-400">
                <ImageIcon className="h-8 w-8" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-400">
          <ImageIcon className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm">Add product images by pasting URLs above</p>
        </div>
      )}
    </div>
  );
}
