-- ========================================
-- ADD CUSTOM PRODUCT SUPPORT TO CART
-- ========================================
-- This migration adds support for prescription medications as custom cart items

-- Add custom_product_name column to cart_items table
ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS custom_product_name TEXT;

-- Make product_id nullable to support custom products
ALTER TABLE cart_items
ALTER COLUMN product_id DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN cart_items.custom_product_name IS 'Custom product name for prescription medications that are not in the products table';

-- Update the foreign key constraint to be optional
-- Note: If you have existing foreign key constraints, you may need to drop and recreate them

-- ========================================
-- NOTES FOR IMPLEMENTATION
-- ========================================
-- This allows cart_items to have either:
-- 1. product_id + null custom_product_name (regular products)
-- 2. null product_id + custom_product_name (prescription medications)
--
-- The selected_variant field can be used to store prescription details as JSON

-- ========================================
-- END OF MIGRATION
-- ========================================
