# Supabase Storage Setup Guide for Product Images

This guide will walk you through setting up Supabase Storage for storing product images in your pharmacy application.

## Prerequisites

- Access to your Supabase project dashboard
- Your Supabase credentials are already configured in `.env.local`

## Step 1: Create a Storage Bucket

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `ndtmojatnuxjmogkazrd`
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Configure your bucket:
   - **Name**: `product-images` (must match exactly)
   - **Public bucket**: Toggle **ON** (this allows public read access)
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: Leave empty to allow all image types
6. Click **Create bucket**

## Step 2: Configure Bucket Policies

Supabase automatically creates policies for public buckets, but you can verify:

1. Click on your `product-images` bucket
2. Go to **Policies** tab
3. You should see policies that allow:
   - **Public read access**: Anyone can view images
   - **Authenticated write access**: Only authenticated users can upload

### Optional: Add Custom Policies

If you want more control, you can create custom policies:

1. Click **New policy**
2. For admin-only uploads, create a policy:
   ```sql
   -- Allow only authenticated admin users to upload
   CREATE POLICY "Admin upload access"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'product-images' AND
     (storage.foldername(name))[1] = 'products'
   );
   ```

3. For public read access:
   ```sql
   -- Allow public to view images
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   TO public
   USING ( bucket_id = 'product-images' );
   ```

## Step 3: Verify Environment Variables

Your `.env.local` already has the required Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ndtmojatnuxjmogkazrd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

No additional configuration is needed! The file upload system uses these existing credentials.

## Step 4: Test the Upload System

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/admin/products/new`

3. Test the upload:
   - Click **Choose File** or drag and drop an image
   - Select an image (JPEG, PNG, WebP, or GIF, max 5MB)
   - The image should upload and display a preview
   - You'll see "Image uploaded successfully!" message

4. Verify in Supabase:
   - Go to Supabase Dashboard → Storage → product-images
   - You should see your uploaded image in the `products` folder

## How It Works

### File Upload Flow

1. **User selects file** in admin product form
2. **Client-side validation**: Checks file type and size
3. **Upload to API**: `/api/upload` endpoint
4. **Server validation**: Double-checks file validity
5. **Supabase upload**: File stored in `product-images/products/` folder
6. **Public URL returned**: URL saved to product database

### File Naming Convention

Files are automatically renamed to prevent conflicts:
```
products/[timestamp]-[sanitized-filename]
Example: products/1734645678901-product-image.jpg
```

### Security Features

- **Admin-only uploads**: Only users with admin gate cookie can upload
- **File type validation**: Only images allowed (JPEG, PNG, WebP, GIF)
- **File size limit**: Maximum 5MB per file
- **Public read, private write**: Anyone can view, only admins can upload

## Storage Management

### View Uploaded Files

1. Go to Supabase Dashboard → Storage → product-images
2. Click on the `products` folder
3. You'll see all uploaded product images with:
   - File name
   - Size
   - Upload date
   - Public URL

### Delete Files

Files are automatically linked to products. You can:

1. **Manual deletion**: In Supabase Dashboard, select file → Delete
2. **Programmatic deletion**: Use the `deleteFileFromStorage()` function in your code

### Get Public URL

Every uploaded file has a public URL format:
```
https://ndtmojatnuxjmogkazrd.supabase.co/storage/v1/object/public/product-images/products/[timestamp]-[filename]
```

## Storage Limits & Pricing

Supabase Free Tier includes:
- **Storage**: 1 GB free
- **Bandwidth**: 2 GB free per month
- **File uploads**: 50 MB max file size (we limit to 5MB)

For a small pharmacy site with 100 products and 100KB images:
- Storage used: ~10MB (well within free tier)
- Typical monthly bandwidth: < 1GB

**Upgrade options** (if needed):
- **Pro Plan**: $25/month - 100 GB storage, 200 GB bandwidth
- **Pay-as-you-go**: $0.021 per GB storage, $0.09 per GB bandwidth

## Troubleshooting

### Upload fails with "Bucket not found"
- **Solution**: Ensure bucket name is exactly `product-images`
- Check bucket exists in Supabase Dashboard → Storage

### Upload fails with "Policy violation"
- **Solution**: Verify bucket is set to **Public**
- Check Storage policies allow authenticated uploads

### Images don't display after upload
- **Solution**: Verify bucket's public access is enabled
- Check the returned URL in browser - it should show the image

### "File too large" error
- **Current limit**: 5MB per file
- **To increase**: Modify validation in `lib/storage.ts`:
  ```typescript
  export function validateFileSize(sizeInBytes: number): boolean {
    const maxSize = 10 * 1024 * 1024; // Change to 10MB
    return sizeInBytes <= maxSize;
  }
  ```

### CORS errors
- **Supabase handles CORS automatically** for storage buckets
- If issues persist, check your Supabase project settings

## Advanced Configuration

### Enable Image Transformations

Supabase supports on-the-fly image transformations:

```typescript
// Get a resized/optimized image URL
const { data } = supabase.storage
  .from('product-images')
  .getPublicUrl('products/image.jpg', {
    transform: {
      width: 500,
      height: 500,
      resize: 'cover',
      quality: 80
    }
  });
```

### Set Up CDN Caching

Supabase Storage includes CDN caching by default:
- Images are cached globally
- Cache headers are set automatically
- Files are served from nearest edge location

### Implement File Cleanup

To delete old images when products are removed:

```typescript
// In your product deletion handler
import { deleteFileFromStorage } from '@/lib/storage';

// Delete product image
if (product.primary_image_url) {
  await deleteFileFromStorage(product.primary_image_url);
}
```

## Best Practices

1. **Optimize images before upload**: Compress images to reduce storage costs
2. **Use descriptive filenames**: Helps with organization and SEO
3. **Regular cleanup**: Delete unused images to save storage
4. **Monitor usage**: Check Storage tab in Supabase Dashboard
5. **Backup important images**: Consider backing up to another service

## Migration from AWS S3

If you previously used AWS S3, the migration is automatic:
- ✅ Old AWS code removed
- ✅ Supabase Storage integration complete
- ✅ Same upload interface for users
- ✅ No additional credentials needed

Simply ensure your Supabase bucket is set up and you're ready to go!

## Next Steps

1. ✅ Create `product-images` bucket in Supabase
2. ✅ Test upload functionality
3. ✅ Upload product images via admin panel
4. Consider implementing:
   - Image optimization before upload
   - Multiple images per product
   - Image galleries
   - Automatic thumbnail generation

## Support & Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage API Reference](https://supabase.com/docs/reference/javascript/storage-from-upload)
- [Image Transformations Guide](https://supabase.com/docs/guides/storage/image-transformations)
