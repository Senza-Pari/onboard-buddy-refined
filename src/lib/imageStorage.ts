import { supabase } from './supabase';

export interface ImageUploadResult {
  url: string;
  path: string;
  error?: string;
}

export class ImageStorageService {
  private static readonly BUCKET_NAME = 'images';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Upload an image to Supabase Storage
   */
  static async uploadImage(
    file: File,
    folder: 'profiles' | 'gallery' | 'covers' = 'gallery',
    userId?: string
  ): Promise<ImageUploadResult> {
    try {
      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          url: '',
          path: '',
          error: `File size must be less than ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
        };
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return {
          url: '',
          path: '',
          error: 'File must be an image'
        };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = userId ? `${folder}/${userId}/${fileName}` : `${folder}/${fileName}`;

      console.log('Uploading image to:', filePath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          url: '',
          path: '',
          error: `Upload failed: ${error.message}`
        };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      console.log('Image uploaded successfully:', publicUrl);

      return {
        url: publicUrl,
        path: data.path,
        error: undefined
      };

    } catch (error) {
      console.error('Image upload error:', error);
      return {
        url: '',
        path: '',
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Delete an image from Supabase Storage
   */
  static async deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return {
          success: false,
          error: `Delete failed: ${error.message}`
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Image delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * Convert blob to File for upload
   */
  static blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type });
  }

  /**
   * Resize image if needed (client-side)
   */
  static async resizeImage(
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Check if Supabase Storage is properly configured
   */
  static async testStorageConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        return {
          success: false,
          error: `Storage connection failed: ${error.message}`
        };
      }

      const bucketExists = data.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        return {
          success: false,
          error: `Storage bucket '${this.BUCKET_NAME}' not found. Please create it in your Supabase dashboard.`
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Storage test failed'
      };
    }
  }
}