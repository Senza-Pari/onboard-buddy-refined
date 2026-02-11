import React, { useState, useEffect, useRef } from 'react';

export type FitMethod = 'cover' | 'contain' | 'stretch';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fitMethod?: FitMethod;
  focusX?: number;
  focusY?: number;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  fitMethod = 'cover',
  focusX = 0.5,
  focusY = 0.5,
  className = '',
  onLoad,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setLoading(false);
      onLoad?.();
      adjustImagePosition();
    };

    img.onerror = () => {
      const error = new Error(`Failed to load image: ${src}`);
      setError(error);
      onError?.(error);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  const adjustImagePosition = () => {
    if (!imgRef.current || !containerRef.current) return;

    const img = imgRef.current;
    const container = containerRef.current;

    if (fitMethod === 'cover') {
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const containerRatio = container.clientWidth / container.clientHeight;

      if (imgRatio > containerRatio) {
        // Image is wider than container
        const scale = container.clientHeight / img.naturalHeight;
        const translateX = (img.naturalWidth * scale - container.clientWidth) * focusX;
        img.style.transform = `translateX(-${translateX}px)`;
      } else {
        // Image is taller than container
        const scale = container.clientWidth / img.naturalWidth;
        const translateY = (img.naturalHeight * scale - container.clientHeight) * focusY;
        img.style.transform = `translateY(-${translateY}px)`;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('resize', adjustImagePosition);
    return () => window.removeEventListener('resize', adjustImagePosition);
  }, []);

  const containerStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || '100%',
    position: 'relative',
    overflow: 'hidden',
  };

  const imageStyle: React.CSSProperties = {
    width: fitMethod === 'contain' ? 'auto' : '100%',
    height: fitMethod === 'contain' ? 'auto' : '100%',
    objectFit: fitMethod === 'stretch' ? 'fill' : fitMethod,
    opacity: loading ? 0 : 1,
    transition: 'opacity 0.3s ease',
  };

  if (error) {
    return (
      <div
        style={containerStyle}
        className={`bg-neutral-100 flex items-center justify-center ${className}`}
      >
        <p className="text-neutral-500 text-sm">Failed to load image</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={imageStyle}
        className="transition-transform duration-300 ease-out"
        onLoad={adjustImagePosition}
      />
    </div>
  );
};

export default ResponsiveImage;