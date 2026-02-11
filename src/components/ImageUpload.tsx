import React, { useRef, useState } from 'react';
import { Upload, Camera, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import heic2any from 'heic2any';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import ResponsiveImage from './ResponsiveImage';
import { ImageStorageService } from '../lib/imageStorage';
import useAuthStore from '../stores/authStore';

interface ImageUploadProps {
  onUpload: (file: File, croppedBlob?: Blob, uploadResult?: { url: string; path: string }) => void;
  aspectRatio?: number;
  maxSize?: number;
  className?: string;
  fitMethod?: 'cover' | 'contain' | 'stretch';
  currentImageUrl?: string;
  enableCropping?: boolean;
  minWidth?: number;
  minHeight?: number;
  folder?: 'profiles' | 'gallery' | 'covers';
  persistToStorage?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  aspectRatio,
  maxSize = 10 * 1024 * 1024,
  className = '',
  fitMethod = 'cover',
  currentImageUrl,
  enableCropping = false,
  minWidth = 400,
  minHeight = 400,
  folder = 'gallery',
  persistToStorage = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [crop, setCrop] = useState<Crop>();
  const [showCropper, setShowCropper] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const { user } = useAuthStore();

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const isValidSize = img.width >= minWidth && img.height >= minHeight;
        if (!isValidSize) {
          setError(`Image must be at least ${minWidth}×${minHeight} pixels`);
        }
        resolve(isValidSize);
      };
      img.onerror = () => {
        setError('Invalid image file');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      try {
        const blob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8,
        });
        return new File([blob as Blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
          type: 'image/jpeg',
        });
      } catch (error) {
        console.error('HEIC conversion failed:', error);
        throw new Error('Failed to convert HEIC image');
      }
    }
    return file;
  };

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      if (file.size > maxSize) {
        throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      }

      // Convert HEIC if needed
      const processedFile = await convertHeicToJpeg(file);
      
      // Validate dimensions
      const meetsMinDimensions = await validateImage(processedFile);
      if (!meetsMinDimensions) {
        return;
      }

      // Resize if too large
      const resizedFile = await ImageStorageService.resizeImage(processedFile);
      
      setOriginalFile(resizedFile);
      const previewUrl = URL.createObjectURL(resizedFile);
      setPreviewUrl(previewUrl);
      
      if (enableCropping && aspectRatio) {
        setShowCropper(true);
      } else {
        await handleFinalUpload(resizedFile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalUpload = async (file: File, croppedBlob?: Blob) => {
    try {
      setIsProcessing(true);
      
      const finalFile = croppedBlob ? ImageStorageService.blobToFile(croppedBlob, file.name) : file;
      
      if (persistToStorage) {
        // Upload to Supabase Storage
        const uploadResult = await ImageStorageService.uploadImage(
          finalFile,
          folder,
          user?.id
        );

        if (uploadResult.error) {
          throw new Error(uploadResult.error);
        }

        setSuccess('Image uploaded successfully!');
        onUpload(finalFile, croppedBlob, uploadResult);
      } else {
        // Just return the file without uploading
        onUpload(finalFile, croppedBlob);
      }

      // Clean up preview URL
      if (previewUrl && previewUrl !== currentImageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await processImage(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImage(file);
    }
  };

  const handleCropComplete = async () => {
    if (!crop || !previewUrl || !originalFile) return;

    const image = new Image();
    image.src = previewUrl;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    canvas.toBlob(async (blob) => {
      if (blob) {
        await handleFinalUpload(originalFile, blob);
        setShowCropper(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    if (previewUrl && previewUrl !== currentImageUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(currentImageUrl || '');
    setOriginalFile(null);
  };

  // Show current image with edit overlay
  if (currentImageUrl && !showCropper && !isProcessing) {
    return (
      <div className={`relative cursor-pointer group ${className}`}>
        <img 
          src={currentImageUrl} 
          alt="Current" 
          className="w-full h-48 object-cover rounded-lg"
        />
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-white text-center">
            <Camera size={24} className="mx-auto mb-2" />
            <span className="text-sm">Change Image</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/heic,image/webp"
          onChange={handleFileSelect}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {!showCropper ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${dragActive ? 'border-primary-400 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'}
            ${error ? 'border-red-300 bg-red-50' : ''}
            ${success ? 'border-green-300 bg-green-50' : ''}
          `}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/heic,image/webp"
            onChange={handleFileSelect}
          />

          {isProcessing ? (
            <div className="flex flex-col items-center">
              <Loader2 size={40} className="text-primary-500 mb-2 animate-spin" />
              <p className="text-sm text-neutral-600">
                {persistToStorage ? 'Uploading image...' : 'Processing image...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Camera size={40} className="text-neutral-400 mb-2" />
              <p className="text-neutral-600">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                JPG, PNG, HEIC or WebP (max {maxSize / (1024 * 1024)}MB)
              </p>
              <p className="text-xs text-neutral-500">
                Minimum size: {minWidth}×{minHeight} pixels
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600">
              <CheckCircle size={16} />
              {success}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            aspect={aspectRatio}
            className="max-h-[500px] overflow-hidden rounded-lg"
          >
            <ResponsiveImage
              src={previewUrl}
              alt="Preview"
              fitMethod={fitMethod}
              className="w-full h-full"
            />
          </ReactCrop>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancelCrop}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  {persistToStorage ? 'Uploading...' : 'Processing...'}
                </div>
              ) : (
                'Crop & Save'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;