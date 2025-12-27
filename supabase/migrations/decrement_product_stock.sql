-- Create a function to atomically decrement product stock
-- This prevents race conditions when multiple orders are placed simultaneously
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION decrement_product_stock(
  product_id_param UUID,
  quantity_param INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atomically update the stock quantity
  -- This prevents race conditions by using a single SQL UPDATE statement
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity - quantity_param)
  WHERE id = product_id_param;

  -- Check if the update affected any rows
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found: %', product_id_param;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users (webhook uses service role, so this is covered)
GRANT EXECUTE ON FUNCTION decrement_product_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_product_stock(UUID, INTEGER) TO service_role;

-- Add a comment to document the function
COMMENT ON FUNCTION decrement_product_stock IS 'Atomically decrements product stock quantity. Used by Stripe webhook to prevent race conditions.';
