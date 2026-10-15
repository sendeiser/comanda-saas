-- ==============================================================================
-- COMANDA SAAS — MASTER DATABASE SCHEMA & MULTI-TENANT ARCHITECTURE
-- Base de Datos Unificada para Todos los Comercios (https://vmnhystuwcbdbukoxdtz.supabase.co)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE COMERCIOS / LOCALES (STORES)
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
    "baseFee": 1500,
    "zones": []
  }'::jsonb,
  payment_settings JSONB DEFAULT '{
    "acceptCash": true,
    "acceptTransfer": true,
    "transferAlias": "COMANDA.FAST",
    "transferCbu": "",
    "transferBank": "",
    "acceptMercadoPago": false,
    "mercadoPagoLink": ""
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores (slug);

-- Local de Demostración por defecto
INSERT INTO public.stores (id, slug, name, tagline, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo',
  'Comanda Demo Gastronómica',
  'Local de Demostración y Pruebas',
  true
) ON CONFLICT (slug) DO NOTHING;

-- 3. PLANES DE SUSCRIPCIÓN SAAS (SAAS_PLANS)
CREATE TABLE IF NOT EXISTS public.saas_plans (
  id VARCHAR(50) PRIMARY KEY, -- 'basico', 'pro', 'full'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_fee NUMERIC(12, 2) NOT NULL,
  billing_period VARCHAR(20) DEFAULT 'mensual',
  is_popular BOOLEAN DEFAULT false,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.saas_plans (id, name, description, monthly_fee, is_popular, features)
VALUES 
  (
    'basico',
    'Plan Básico',
    'Ideal para carritos, venta en mostrador y delivery inicial',
    18000.00,
    false,
    '["Punto de Venta Táctil Mostrador", "Carta Digital Web QR por Local", "Control de Caja y Arqueo Ciego", "Tickets Térmicos 58mm y 80mm", "Soporte estándar WhatsApp"]'::jsonb
  ),
  (
    'pro',
    'Plan Pro Gastronómico',
    'La solución más elegida para locales con salón, cocina y WhatsApp activo',
    28000.00,
    true,
    '["Todo lo del Plan Básico", "Módulo de Salón & Mapa de Mesas en vivo", "Bot de WhatsApp Local 24/7 sin APIs caras", "Pantalla de Cocina KDS con sonido", "Actualizaciones en tiempo real"]'::jsonb
  ),
  (
    'full',
    'Plan Full Franquicia',
    'Control absoluto con gestión de fiados, múltiples terminales y soporte VIP',
    38000.00,
    false,
    '["Todo lo del Plan Pro Gastronómico", "CRM de Clientes & Libreta de Fiados", "Cobranzas por WhatsApp en 1 clic", "Múltiples Cajas y Roles de Cajero", "Soporte prioritario VIP 24/7"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_fee = EXCLUDED.monthly_fee,
  is_popular = EXCLUDED.is_popular,
  features = EXCLUDED.features,
  updated_at = NOW();

-- 4. SUSCRIPCIONES DE COMERCIOS (STORE_SUBSCRIPTIONS)
CREATE TABLE IF NOT EXISTS public.store_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  store_slug VARCHAR(100) NOT NULL,
  store_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  owner_phone VARCHAR(50),
  owner_email VARCHAR(255),
  plan_id VARCHAR(50) REFERENCES public.saas_plans(id) DEFAULT 'pro',
  monthly_fee NUMERIC(12, 2) NOT NULL DEFAULT 28000.00,
  billing_day INT DEFAULT 10,
  status VARCHAR(30) DEFAULT 'al_dia', -- al_dia, por_vencer, vencido, suspendido
  is_manually_suspended BOOLEAN DEFAULT false,
  last_payment_date TIMESTAMPTZ DEFAULT NOW(),
  last_payment_amount NUMERIC(12, 2) DEFAULT 28000.00,
  last_payment_method VARCHAR(50) DEFAULT 'transferencia',
  next_due_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_slug)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.store_subscriptions (status);

-- 5. TABLA DE MESAS DE RESTAURANTE (RESTAURANT_TABLES)
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

-- 6. CRM DE CLIENTES & LIBRETA DE FIADOS (CUSTOMERS)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  store_slug VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  notes TEXT,
  current_balance NUMERIC(12, 2) DEFAULT 0.00,
  total_orders_count INT DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  last_payment_at TIMESTAMPTZ,
  ledger JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_store ON public.customers (store_id, current_balance);

-- 7. TABLA DE PRODUCTOS / MENÚ (PRODUCTS)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  emoji TEXT DEFAULT '🍔',
  description TEXT,
  modifiers JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  stock INT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id, category);

-- 8. TABLA DE COMANDAS / PEDIDOS (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  channel TEXT NOT NULL, -- 'whatsapp' | 'mostrador' | 'mesa'
  table_number TEXT,
  customer JSONB DEFAULT '{}'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL, -- 'efectivo' | 'transferencia' | 'tarjeta' | 'a_cuenta'
  cash_paid NUMERIC(10, 2),
  cash_change NUMERIC(10, 2),
  transfer_proof TEXT,
  transfer_confirmed BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente' | 'cocina' | 'listo' | 'entregado' | 'cancelado'
  status_timestamps JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_store_status ON public.orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 9. TABLA DE TURNOS DE CAJA / ARQUEOS (CASH_SHIFTS)
CREATE TABLE IF NOT EXISTS public.cash_shifts (
  id TEXT PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  opened_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  initial_cash NUMERIC(10, 2) NOT NULL DEFAULT 0,
  counted_cash NUMERIC(10, 2),
  cashier_name TEXT NOT NULL DEFAULT 'Cajero 1',
  expenses JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shifts_store ON public.cash_shifts(store_id, is_closed);

-- 10. TABLA DE CAJEROS (CASHIERS)
CREATE TABLE IF NOT EXISTS public.cashiers (
  id TEXT PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cajero',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. TABLA DE CONFIGURACIONES Y BOT (SYSTEM_SETTINGS & BOT_CONFIG)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bot_config (
  id TEXT PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) Y POLÍTICAS DE ACCESO
-- ==============================================================================
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_config ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas universales (para acceso anónimo y autenticado vía API Key)
CREATE POLICY "stores_all" ON public.stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "plans_all" ON public.saas_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "subscriptions_all" ON public.store_subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tables_all" ON public.restaurant_tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "customers_all" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "products_all" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "orders_all" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "cash_shifts_all" ON public.cash_shifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "cashiers_all" ON public.cashiers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "system_settings_all" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bot_config_all" ON public.bot_config FOR ALL USING (true) WITH CHECK (true);

-- 13. HABILITAR REALTIME EN LAS TABLAS CRÍTICAS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_shifts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
