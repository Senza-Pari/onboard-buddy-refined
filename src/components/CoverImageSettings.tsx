import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, X, AlertCircle, CheckCircle } from 'lucide-react';
import ImageUpload from './ImageUpload';
import useImageStore from '../stores/imageStore';

interface CoverImageSettingsProps {
  className?: string;
}

const CoverImageSettings: React.FC<CoverImageSettingsProps> = ({ className = '' }) => {
  const { welcomeBackground, welcomeBackgroundPath, setWelcomeBackground } = useImageStore();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleImageUpload = async (file: File, croppedBlob?: Blob, uploadResult?: { url: string; path: string }) => {
    try {
      setError('');
      setSuccess('');
      
      if (uploadResult) {
        // Image was uploaded to storage
        setWelcomeBackground(uploadResult.url, uploadResult.path);
        setSuccess('Cover image updated successfully!');
      } else {
        // Fallback to blob URL (shouldn't happen with persistToStorage=true)
        const imageUrl = URL.createObjectURL(croppedBlob || file);
        setWelcomeBackground(imageUrl);
        setSuccess('Cover image updated!');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update cover image. Please try again.');
    }
  };

  const handleRemoveImage = () => {
    setWelcomeBackground(null);
    setSuccess('Cover image removed');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleResetToDefault = () => {
    setWelcomeBackground('https://cameronstewart.click/onboardingbuddy/onboarding-buddy-cover-image.jpg');
    setSuccess('Cover image reset to default');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-neutral-900">Cover Image</h3>
        {welcomeBackground && welcomeBackground !== 'https://cameronstewart.click/onboardingbuddy/onboarding-buddy-cover-image.jpg' && (
          <button
            onClick={handleRemoveImage}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Remove Image
          </button>
        )}
      </div>

      <div className="bg-neutral-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Requirements</h4>
        <ul className="text-sm text-neutral-600 space-y-1">
          <li>• Maximum file size: 5MB</li>
          <li>• Recommended dimensions: 1200x400 pixels</li>
          <li>• Supported formats: JPG, PNG, WebP, HEIC</li>
          <li>• Images are automatically optimized and stored securely</li>
        </ul>
      </div>

      {welcomeBackground ? (
        <div className="relative rounded-lg overflow-hidden bg-neutral-100">
          <img
            src={welcomeBackground}
            alt="Cover"
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
            <button
              onClick={() => setWelcomeBackground(null)}
              className="p-2 bg-white rounded-full text-neutral-900 hover:bg-neutral-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <ImageUpload
          onUpload={handleImageUpload}
          maxSize={5 * 1024 * 1024} // 5MB
          minWidth={1200}
          minHeight={400}
          enableCropping
          aspectRatio={3}
          folder="covers"
          persistToStorage={true}
        />
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg"
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg"
        >
          <CheckCircle size={16} />
          {success}
        </motion.div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleResetToDefault}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default CoverImageSettings;