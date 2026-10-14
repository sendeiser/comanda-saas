-- supabase/migrations/001_multi_tenant_stores.sql
-- Multi-Tenant Schema for Gastronomy White-Label Platform

-- 1. STORES TABLE
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  industry VARCHAR(50) DEFAULT 'fast_food', -- fast_food, pizzeria, rotiseria, restaurant, cafe
  logo_url TEXT,
  banner_url TEXT,
  favicon_url TEXT,
  theme JSONB DEFAULT '{
    "primaryColor": "#f59e0b",
    "primaryColorText": "#ffffff",
    "accentColor": "#10b981",
    "bgDark": "#0b0f19",
    "surfaceDark": "#111827",
    "fontFamily": "Plus Jakarta Sans, sans-serif"
  }'::jsonb,
  contact_info JSONB DEFAULT '{
    "phone": "",
    "whatsapp": "",
    "instagram": "",
    "address": "",
    "googleMapsUrl": ""
  }'::jsonb,
  business_hours JSONB DEFAULT '{
    "monday": { "open": "19:30", "close": "00:00", "isOpen": true },
    "tuesday": { "open": "19:30", "close": "00:00", "isOpen": true },
    "wednesday": { "open": "19:30", "close": "00:00", "isOpen": true },
    "thursday": { "open": "19:30", "close": "00:00", "isOpen": true },
    "friday": { "open": "19:30", "close": "01:00", "isOpen": true },
    "saturday": { "open": "19:30", "close": "01:00", "isOpen": true },
    "sunday": { "open": "19:30", "close": "00:00", "isOpen": true }
  }'::jsonb,
  delivery_settings JSONB DEFAULT '{
    "enabled": true,
    "baseFee": 1000,
    "zones": []
  }'::jsonb,
  payment_settings JSONB DEFAULT '{
    "acceptCash": true,
    "acceptTransfer": true,
    "transferAlias": "",
    "transferCbu": "",
    "transferBank": "",
    "acceptMercadoPago": false,
    "mercadoPagoLink": ""
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant lookup by slug (URL routing)
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores (slug);

-- 2. ADD store_id TO EXISTING TABLES WITH CASCADE & RLS
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.categories ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.cash_shifts ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;

-- 3. RESTAURANT TABLES (SALON & MESAS)
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  table_number INT NOT NULL,
  label VARCHAR(50),
  capacity INT DEFAULT 4,
  status VARCHAR(30) DEFAULT 'free', -- free, occupied, bill_requested
  current_order_id TEXT,
  opened_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (store_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_tables_store_status ON public.restaurant_tables (store_id, status);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active store profiles by slug
CREATE POLICY "Public stores view" ON public.stores
  FOR SELECT USING (is_active = true);

-- Allow authenticated and anon reading of tables for the store
CREATE POLICY "Store tables view" ON public.restaurant_tables
  FOR SELECT USING (true);

CREATE POLICY "Store tables update" ON public.restaurant_tables
  FOR ALL USING (true);
