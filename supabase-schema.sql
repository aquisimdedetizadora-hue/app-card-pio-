-- =========================================================================
-- SUPABASE POSTGRESQL DATABASE SCHEMA: CARDÁPIO DIGITAL MULTI-RESTAURANTE
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,
  description TEXT,
  phone TEXT,
  whatsapp TEXT,
  instagram TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  logo_url TEXT,
  cover_url TEXT,
  is_open_manual BOOLEAN DEFAULT true,
  auto_close_enabled BOOLEAN DEFAULT true,
  use_automatic_hours BOOLEAN DEFAULT false,
  allow_orders_when_closed BOOLEAN DEFAULT true,
  business_hours JSONB DEFAULT '[]'::jsonb,
  delivery JSONB DEFAULT '{}'::jsonb,
  pickup JSONB DEFAULT '{}'::jsonb,
  dine_in JSONB DEFAULT '{}'::jsonb,
  payment_methods JSONB DEFAULT '{}'::jsonb,
  theme JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slug lookup (public menu)
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants (slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON restaurants (owner_id);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories (restaurant_id);

-- 3. ADDON GROUPS TABLE
CREATE TABLE IF NOT EXISTS addon_groups (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  min_quantity INT DEFAULT 0,
  max_quantity INT DEFAULT 1,
  options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addon_groups_restaurant ON addon_groups (restaurant_id);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  promotional_price NUMERIC(10,2),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  internal_code TEXT,
  display_order INT DEFAULT 0,
  variants JSONB DEFAULT '[]'::jsonb,
  addon_group_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_restaurant ON products (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_type TEXT NOT NULL DEFAULT 'delivery',
  table_number TEXT,
  delivery_address JSONB,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL DEFAULT 'pix',
  need_change BOOLEAN DEFAULT false,
  change_for_amount NUMERIC(10,2),
  general_observations TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  whatsapp_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- 6. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  restaurant_ids JSONB DEFAULT '[]'::jsonb,
  active_restaurant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Setup
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public read policies (Anonymous visitors can read menus, categories, products, addons)
DROP POLICY IF EXISTS "Public can view restaurants" ON restaurants;
CREATE POLICY "Public can view restaurants" ON restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view categories" ON categories;
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view addon_groups" ON addon_groups;
CREATE POLICY "Public can view addon_groups" ON addon_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create orders" ON orders;
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view their own orders" ON orders;
CREATE POLICY "Public can view their own orders" ON orders FOR SELECT USING (true);

-- Allow authenticated/service writes
DROP POLICY IF EXISTS "Enable all access for authenticated or service" ON restaurants;
CREATE POLICY "Enable all access for authenticated or service" ON restaurants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for categories" ON categories;
CREATE POLICY "Enable all access for categories" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for products" ON products;
CREATE POLICY "Enable all access for products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for addon_groups" ON addon_groups;
CREATE POLICY "Enable all access for addon_groups" ON addon_groups FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for orders" ON orders;
CREATE POLICY "Enable all access for orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for users" ON users;
CREATE POLICY "Enable all access for users" ON users FOR ALL USING (true) WITH CHECK (true);
