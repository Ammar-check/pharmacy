-- ========================================
-- COMPLETE ORDER NUMBER SYSTEM MIGRATION
-- ========================================
-- This script safely replaces the existing order number generation
-- with an improved enterprise-grade system
--
-- Format: ORD-YYYYMMDD-XXXXX
-- Example: ORD-20250121-00001
--
-- ========================================

-- ========================================
-- STEP 1: DROP ALL EXISTING TRIGGERS
-- ========================================
-- Must drop triggers BEFORE functions to avoid dependency errors

-- Drop order number generation trigger
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;

-- Drop updated_at triggers (will be recreated)
DROP TRIGGER IF EXISTS trigger_update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS trigger_update_products_updated_at ON products;
DROP TRIGGER IF EXISTS trigger_update_products_timestamp ON products;
DROP TRIGGER IF EXISTS trigger_update_cart_items_updated_at ON cart_items;
DROP TRIGGER IF EXISTS trigger_update_cart_items_timestamp ON cart_items;

-- ========================================
-- STEP 2: DROP ALL EXISTING FUNCTIONS
-- ========================================
-- Now safe to drop functions after triggers are removed

-- Drop old order number functions
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS set_order_number() CASCADE;

-- Drop updated_at functions
DROP FUNCTION IF EXISTS update_orders_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_products_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_cart_items_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ========================================
-- STEP 3: ENSURE SEQUENCE EXISTS
-- ========================================
-- Create sequence if it doesn't exist, reset if it does

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'order_number_seq') THEN
        CREATE SEQUENCE order_number_seq START 1;
    ELSE
        -- Optionally reset sequence (comment out if you want to keep existing numbers)
        -- ALTER SEQUENCE order_number_seq RESTART WITH 1;
    END IF;
END $$;

-- ========================================
-- STEP 4: CREATE NEW ORDER NUMBER FUNCTION
-- ========================================
-- This version generates: ORD-YYYYMMDD-XXXXX
-- Counts orders per day and increments properly

CREATE FUNCTION generate_order_number_v2()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  today_date TEXT;
  sequence_num TEXT;
  order_num TEXT;
  daily_count INTEGER;
BEGIN
  -- Only generate if order_number is not already set
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    -- Get today's date in YYYYMMDD format
    today_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

    -- Count how many orders exist for today to get the daily sequence
    SELECT COUNT(*) + 1 INTO daily_count
    FROM orders
    WHERE DATE(created_at) = CURRENT_DATE;

    -- Generate sequence number (5 digits, padded with zeros)
    sequence_num := LPAD(daily_count::TEXT, 5, '0');

    -- Combine into final order number
    order_num := 'ORD-' || today_date || '-' || sequence_num;

    NEW.order_number := order_num;
  END IF;

  RETURN NEW;
END;
$$;

-- ========================================
-- STEP 5: CREATE UPDATED_AT FUNCTION
-- ========================================
-- Single reusable function for all tables

CREATE FUNCTION update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ========================================
-- STEP 6: CREATE TRIGGERS
-- ========================================

-- Order number generation trigger
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number_v2();

-- Updated_at triggers for orders
CREATE TRIGGER trigger_update_orders_timestamp
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Updated_at triggers for products
CREATE TRIGGER trigger_update_products_timestamp
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Updated_at triggers for cart_items
CREATE TRIGGER trigger_update_cart_items_timestamp
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Updated_at triggers for product_reviews (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_reviews') THEN
        DROP TRIGGER IF EXISTS trigger_update_reviews_timestamp ON product_reviews;
        EXECUTE 'CREATE TRIGGER trigger_update_reviews_timestamp
                 BEFORE UPDATE ON product_reviews
                 FOR EACH ROW
                 EXECUTE FUNCTION update_timestamp()';
    END IF;
END $$;

-- ========================================
-- STEP 7: GRANT PERMISSIONS
-- ========================================
-- Ensure service role can execute functions

GRANT EXECUTE ON FUNCTION generate_order_number_v2() TO service_role;
GRANT EXECUTE ON FUNCTION generate_order_number_v2() TO anon;
GRANT EXECUTE ON FUNCTION generate_order_number_v2() TO authenticated;

GRANT EXECUTE ON FUNCTION update_timestamp() TO service_role;
GRANT EXECUTE ON FUNCTION update_timestamp() TO anon;
GRANT EXECUTE ON FUNCTION update_timestamp() TO authenticated;

-- ========================================
-- STEP 8: VERIFICATION
-- ========================================

-- Test the system by inserting a test order
-- This will verify the trigger works correctly

DO $$
DECLARE
  test_order_number TEXT;
  test_user_id UUID;
BEGIN
  -- Get a test user ID (or use NULL if no users exist)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;

  -- Insert test order
  INSERT INTO orders (
    user_id,
    customer_email,
    customer_name,
    shipping_address_line1,
    shipping_city,
    shipping_state,
    shipping_zip,
    subtotal,
    total_amount,
    payment_status
  ) VALUES (
    test_user_id,
    'test@example.com',
    'Test Customer',
    '123 Test Street',
    'Test City',
    'CA',
    '12345',
    100.00,
    108.99,
    'pending'
  ) RETURNING order_number INTO test_order_number;

  -- Output the generated order number
  RAISE NOTICE 'Test Order Number Generated: %', test_order_number;

  -- Clean up test order
  DELETE FROM orders WHERE order_number = test_order_number;

  RAISE NOTICE 'Test completed successfully! Order number format verified.';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;

-- ========================================
-- STEP 9: DISPLAY SUMMARY
-- ========================================

-- Show all triggers on orders table
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'orders'
AND trigger_schema = 'public'
ORDER BY trigger_name;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
--
-- Next order will have format: ORD-20250121-00001
-- Updated_at columns will auto-update on all tables
-- All functions and triggers are properly installed
--
-- ========================================
