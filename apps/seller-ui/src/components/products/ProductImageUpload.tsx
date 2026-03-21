'use client';

import React, { useState, useRef, useCallback } from 'react';
import { IKUpload } from 'imagekitio-next';
import { X, ImageIcon, Upload, Loader2 } from 'lucide-react';

interface UploadedImage {
  url: string;
  file_id?: string;
}

interface ProductImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

const authenticator = async () => {
  const res = await fetch('/api/imagekit-auth');
  if (!res.ok) throw new Error('Auth failed');
  return res.json();
};

export function ProductImageUpload({
  images,
  onChange,
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ikUploadRef = useRef<HTMLInputElement | null>(null);

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const onUploadStart = () => {
    setUploading(true);
    setError(null);
  };

  const onUploadSuccess = (res: any) => {
    setUploading(false);
    onChange([...images, { url: res.url, file_id: res.fileId }]);
  };

  const onUploadError = (err: any) => {
    setUploading(false);
    setError(err?.message || 'Upload failed. Please try again.');
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      const input = ikUploadRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        Array.from(e.dataTransfer.files).forEach(file => {
          if (file.type.startsWith('image/')) {
            dataTransfer.items.add(file);
          }
        });
        if (dataTransfer.files.length > 0) {
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }
  }, []);

  const triggerUpload = () => {
    ikUploadRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Hidden IKUpload input */}
      <IKUpload
        urlEndpoint={urlEndpoint}
        publicKey={publicKey}
        authenticator={authenticator}
        onUploadStart={onUploadStart}
        onSuccess={onUploadSuccess}
        onError={onUploadError}
        folder="/products"
        accept="image/*"
        ref={ikUploadRef}
        style={{ display: 'none' }}
      />

      {/* Drop zone / Upload button */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerUpload}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Upload className="h-8 w-8" />
            <p className="text-sm font-medium">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Image preview grid */}
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
                onClick={e => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
