-- ========================================
-- ORDER NUMBER GENERATION SYSTEM
-- ========================================
-- Creates a function to generate sequential order numbers
-- Format: ORD-YYYYMMDD-XXXXX
-- Example: ORD-20250121-00001

-- Drop existing function if it exists (to avoid conflicts)
DROP FUNCTION IF EXISTS generate_order_number();

-- Create a sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Function to generate order number
CREATE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  today_date TEXT;
  sequence_num TEXT;
  order_num TEXT;
  existing_count INTEGER;
BEGIN
  -- Get today's date in YYYYMMDD format
  today_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  -- Count how many orders exist for today
  SELECT COUNT(*) INTO existing_count
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;

  -- Generate sequence number (5 digits, padded with zeros)
  sequence_num := LPAD((existing_count + 1)::TEXT, 5, '0');

  -- Combine into final order number
  order_num := 'ORD-' || today_date || '-' || sequence_num;

  RETURN order_num;
END;
$$;

-- Drop existing trigger function if it exists
DROP FUNCTION IF EXISTS set_order_number() CASCADE;

-- Create trigger to auto-generate order number on insert
CREATE FUNCTION set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only set order_number if it's not already set
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;

-- Create trigger
CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- Test the function
-- SELECT generate_order_number(); -- Example output: ORD-20250121-00001

-- ========================================
-- UPDATE FUNCTION FOR updated_at TIMESTAMP
-- ========================================
-- Automatically update the updated_at column on any update

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Apply to orders table
DROP TRIGGER IF EXISTS trigger_update_orders_timestamp ON orders;
CREATE TRIGGER trigger_update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply to products table
DROP TRIGGER IF EXISTS trigger_update_products_timestamp ON products;
CREATE TRIGGER trigger_update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply to cart_items table
DROP TRIGGER IF EXISTS trigger_update_cart_items_timestamp ON cart_items;
CREATE TRIGGER trigger_update_cart_items_timestamp
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- GRANT PERMISSIONS
-- ========================================
-- Ensure the service role can execute these functions

GRANT EXECUTE ON FUNCTION generate_order_number() TO service_role;
GRANT EXECUTE ON FUNCTION set_order_number() TO service_role;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO service_role;

-- ========================================
-- VERIFICATION QUERY
-- ========================================
-- Run this to test the order number generation:
--
-- INSERT INTO orders (
--   user_id,
--   customer_email,
--   customer_name,
--   shipping_address_line1,
--   shipping_city,
--   shipping_state,
--   shipping_zip,
--   subtotal,
--   total_amount
-- ) VALUES (
--   (SELECT id FROM auth.users LIMIT 1),
--   'test@example.com',
--   'Test Customer',
--   '123 Test St',
--   'Test City',
--   'CA',
--   '12345',
--   100.00,
--   108.99
-- ) RETURNING order_number;
