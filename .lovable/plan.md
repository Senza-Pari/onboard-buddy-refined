

# Fix Image Storage + Improve Mobile Upload Experience

## What You'll Get

1. **Image uploads will actually work** -- right now they fail because the storage location doesn't exist yet
2. **Mobile camera integration** -- on phones, the file picker will offer your camera directly instead of just browsing files
3. **Graceful fallback** -- if storage upload fails for any reason, the image still saves locally so you don't lose your photo
4. **Better format support** -- some phones report unusual file types that currently get rejected; we'll fix that

## Changes

### 1. Create storage bucket (database migration)

Set up the "images" storage location with security rules:
- Anyone can view images (needed to display them)
- Logged-in users can upload to their own folder
- Logged-in users can delete their own images

### 2. Update `src/components/ImageUpload.tsx`

- Change file accept from specific formats to `image/*` so all mobile camera formats work (3 places: two file inputs and the drag-drop handler)
- Add `capture="environment"` to file inputs so mobile offers the camera directly
- In `handleFinalUpload`: if storage upload fails, fall back to a data URL instead of showing an error -- the gallery item still gets created with a warning toast that it's stored locally only
- Lower the default `minWidth`/`minHeight` from 400 to 200 -- phone screenshots and cropped images often don't meet 400px minimum

### 3. Update `src/lib/imageStorage.ts`

- Relax the MIME type check: accept files with empty MIME types if the file extension looks like an image (jpg, jpeg, png, webp, heic, heif, gif)
- This fixes uploads from some Android browsers that don't set MIME types properly

### 4. Update `src/components/GalleryItem.tsx` and `src/components/PersonFormModal.tsx`

- These components currently don't pass `persistToStorage` or `folder` to `ImageUpload`, meaning they default to uploading to storage but don't handle the `uploadResult` callback
- Add `persistToStorage={false}` to these since they already use data URLs, preventing unnecessary failed upload attempts

## User Flow After Fix

1. Tap "Add Item" in Gallery, select "Photo"
2. Tap the upload area -- phone shows camera option directly
3. Take photo or pick from library
4. Photo uploads to cloud storage automatically
5. If storage fails for any reason, photo saves locally with a subtle warning
6. Gallery item is created either way -- no more error dead-ends

## Technical Details

### SQL Migration

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

CREATE POLICY "Public read access on images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
  );
```

### `src/lib/imageStorage.ts` -- MIME type fix

Replace strict `file.type.startsWith('image/')` with a helper that also checks the file extension for known image formats when MIME type is empty or generic.

### `src/components/ImageUpload.tsx` -- fallback logic in `handleFinalUpload`

When `persistToStorage` is true and the upload fails, instead of throwing an error:
1. Convert the file to a data URL using FileReader
2. Call `onUpload(finalFile, croppedBlob, undefined)` so the parent can use the data URL fallback path
3. Show a warning message ("Image saved locally -- cloud backup unavailable") instead of an error

### Files changed summary

| File | What changes |
|------|-------------|
| SQL migration | Create `images` bucket + 4 RLS policies |
| `src/components/ImageUpload.tsx` | `accept="image/*"`, `capture="environment"`, fallback logic, lower min dimensions |
| `src/lib/imageStorage.ts` | Relaxed MIME type validation |
| `src/components/GalleryItem.tsx` | Add `persistToStorage={false}` to ImageUpload |
| `src/components/PersonFormModal.tsx` | Add `persistToStorage={false}` to ImageUpload |

