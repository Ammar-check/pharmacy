-- ========================================
-- PRODUCTS AND E-COMMERCE SCHEMA
-- ========================================
-- This schema creates tables for product management and shopping cart functionality
-- for the MedConnect pharmacy platform.

-- ========================================
-- 1. PRODUCTS TABLE
-- ========================================
-- Stores all product information including details, pricing, and inventory

CREATE TABLE IF NOT EXISTS products (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Product Information
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE, -- URL-friendly identifier
    sku VARCHAR(100) UNIQUE, -- Stock Keeping Unit
    short_description TEXT,

    -- Product Details (matching BPC-157 reference structure)
    product_overview TEXT, -- Main product description
    key_features JSONB, -- Array of key feature points
    product_details JSONB, -- Structured product details (contents, form, grade, etc.)
    storage_handling TEXT, -- Storage and handling instructions
    usage_instructions TEXT, -- How to use the product
    benefits TEXT, -- Product benefits
    ingredients JSONB, -- Array of ingredients/composition
    disclaimer TEXT, -- Legal disclaimer text

    -- Pricing & Inventory
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    compare_at_price DECIMAL(10, 2), -- Original price for showing discount
    cost_per_unit DECIMAL(10, 2), -- Cost basis

    -- Product Variants (sizes, dosages, etc.)
    has_variants BOOLEAN DEFAULT false,
    variants JSONB, -- Array of variant objects [{size: "5mg", price: 99.99, sku: "BPC-5MG"}, ...]

    -- Inventory Management
    track_inventory BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    allow_backorder BOOLEAN DEFAULT false,

    -- Media
    primary_image_url TEXT, -- Main product image
    image_gallery JSONB, -- Array of additional image URLs
    video_url TEXT, -- Product video if any

    -- Categorization & Organization
    category VARCHAR(100), -- e.g., "Peptides", "Weight Loss", "Dermatology"
    subcategory VARCHAR(100),
    tags JSONB, -- Array of tags for filtering/search

    -- SEO & Marketing
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured BOOLEAN DEFAULT false, -- Show on homepage/featured section
    best_seller BOOLEAN DEFAULT false,
    new_arrival BOOLEAN DEFAULT false,
    on_sale BOOLEAN DEFAULT false,

    -- Product Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, archived, out_of_stock
    published_at TIMESTAMP WITH TIME ZONE,

    -- Certifications & Compliance (for pharmaceutical products)
    certifications JSONB, -- Array of certification info [{name: "FDA Registered", url: "..."}]
    requires_prescription BOOLEAN DEFAULT false,
    age_restricted BOOLEAN DEFAULT false,
    min_age INTEGER,

    -- Shipping & Fulfillment
    weight_oz DECIMAL(10, 2), -- Weight in ounces
    dimensions_inches VARCHAR(50), -- e.g., "4x4x6"
    ships_separately BOOLEAN DEFAULT false,
    shipping_note TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Admin tracking
    created_by UUID, -- Admin who created the product
    updated_by UUID  -- Last admin who updated
);

-- ========================================
-- 2. CART ITEMS TABLE
-- ========================================
-- Stores items in shopping carts (both guest and authenticated users)

CREATE TABLE IF NOT EXISTS cart_items (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User identification (nullable for guest carts)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest carts (cookie/session based)

    -- Product reference
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    -- Variant selection
    selected_variant JSONB, -- {size: "5mg", price: 99.99, sku: "BPC-5MG"}

    -- Quantity and pricing
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_at_add DECIMAL(10, 2) NOT NULL, -- Price when added (preserve pricing)

    -- Timestamps
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one product per cart (user can update quantity instead of duplicating)
    CONSTRAINT unique_cart_item UNIQUE (user_id, product_id, session_id)
);

-- ========================================
-- 3. ORDERS TABLE
-- ========================================
-- Stores customer orders

CREATE TABLE IF NOT EXISTS orders (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable order number

    -- Customer information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),

    -- Shipping Address
    shipping_address_line1 VARCHAR(255) NOT NULL,
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(50) NOT NULL,
    shipping_zip VARCHAR(10) NOT NULL,
    shipping_country VARCHAR(100) DEFAULT 'USA',

    -- Billing Address (if different)
    billing_same_as_shipping BOOLEAN DEFAULT true,
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(50),
    billing_zip VARCHAR(10),
    billing_country VARCHAR(100),

    -- Order Totals
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,

    -- Payment Information
    payment_method VARCHAR(50), -- e.g., "credit_card", "paypal"
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    paid_at TIMESTAMP WITH TIME ZONE,

    -- Order Status & Fulfillment
    order_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled', -- unfulfilled, partial, fulfilled
    tracking_number VARCHAR(255),
    tracking_url TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,

    -- Notes & Special Instructions
    customer_notes TEXT,
    internal_notes TEXT, -- Admin notes

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    ip_address INET,
    user_agent TEXT
);

-- ========================================
-- 4. ORDER ITEMS TABLE
-- ========================================
-- Stores individual items within an order

CREATE TABLE IF NOT EXISTS order_items (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Order reference
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Product reference (nullable in case product is deleted later)
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,

    -- Product snapshot (preserve product details at time of order)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_image_url TEXT,
    selected_variant JSONB, -- Variant details at time of purchase

    -- Pricing & Quantity
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL, -- quantity * unit_price

    -- Fulfillment
    fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled', -- unfulfilled, fulfilled
    fulfilled_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 5. PRODUCT REVIEWS TABLE (Optional Enhancement)
-- ========================================
-- Stores customer product reviews and ratings

CREATE TABLE IF NOT EXISTS product_reviews (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,

    -- Verification
    verified_purchase BOOLEAN DEFAULT false,

    -- Moderation
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    moderated_by UUID, -- Admin who approved/rejected
    moderated_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 6. INDEXES FOR PERFORMANCE
-- ========================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Product reviews indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);

-- ========================================
-- 7. TRIGGERS
-- ========================================

-- Auto-update updated_at timestamp for products
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Auto-update updated_at timestamp for cart_items
CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_items_updated_at();

-- Auto-update updated_at timestamp for orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ORD-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- ========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Products Policies (Public read, Admin write)
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (status = 'active');

CREATE POLICY "Admins can view all products"
    ON products FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert products"
    ON products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update products"
    ON products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete products"
    ON products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Cart Items Policies
CREATE POLICY "Users can view own cart items"
    ON cart_items FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cart items"
    ON cart_items FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cart items"
    ON cart_items FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own cart items"
    ON cart_items FOR DELETE
    USING (user_id = auth.uid());

-- Orders Policies
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Order Items Policies
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can create order items for own orders"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

-- Product Reviews Policies
CREATE POLICY "Anyone can view approved reviews"
    ON product_reviews FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Users can view own reviews"
    ON product_reviews FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create reviews"
    ON product_reviews FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
    ON product_reviews FOR UPDATE
    USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can moderate reviews"
    ON product_reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ========================================
-- 9. FUNCTIONS FOR BUSINESS LOGIC
-- ========================================

-- Function to calculate cart total
CREATE OR REPLACE FUNCTION get_cart_total(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(price_at_add * quantity), 0)
    INTO total
    FROM cart_items
    WHERE user_id = p_user_id;

    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to get product rating average
CREATE OR REPLACE FUNCTION get_product_rating(p_product_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_rating DECIMAL(3,2);
BEGIN
    SELECT COALESCE(AVG(rating), 0)
    INTO avg_rating
    FROM product_reviews
    WHERE product_id = p_product_id
    AND status = 'approved';

    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 10. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE products IS 'Stores pharmaceutical products with detailed information matching industry standards';
COMMENT ON TABLE cart_items IS 'Stores shopping cart items for both authenticated and guest users';
COMMENT ON TABLE orders IS 'Stores customer orders with complete shipping and payment information';
COMMENT ON TABLE order_items IS 'Stores individual line items within orders with product snapshots';
COMMENT ON TABLE product_reviews IS 'Stores customer product reviews and ratings';

-- ========================================
-- END OF SCHEMA
-- ========================================
