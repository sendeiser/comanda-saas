-- supabase/migrations/002_saas_plans_and_subscriptions.sql
-- SaaS Plans, Store Subscriptions and Customers Fiados CRM

-- 1. SAAS PLANS TABLE
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

-- Seed Default Plans
INSERT INTO public.saas_plans (id, name, description, monthly_fee, is_popular, features)
VALUES 
  (
    'basico',
    'Plan Básico',
    'Ideal para negocios que comienzan con venta en mostrador y delivery',
    18000.00,
    false,
    '[
      "Punto de Venta Mostrador (POS)",
      "Carta Digital Web QR por Local",
      "Control de Caja y Arqueo Ciego",
      "Tickets Térmicos 58mm y 80mm",
      "Soporte estándar"
    ]'::jsonb
  ),
  (
    'pro',
    'Plan Pro Gastronómico',
    'La solución más completa para locales con salón, cocina y WhatsApp activo',
    28000.00,
    true,
    '[
      "Todo lo del Plan Básico",
      "Módulo de Salón & Mapa de Mesas en vivo",
      "Bot de WhatsApp Local 24/7 sin APIs caras",
      "Pantalla de Cocina KDS con sonido",
      "Actualizaciones en tiempo real"
    ]'::jsonb
  ),
  (
    'full',
    'Plan Full Franquicia',
    'Control absoluto con gestión de fiados, múltiples terminales y soporte VIP',
    38000.00,
    false,
    '[
      "Todo lo del Plan Pro Gastronómico",
      "CRM de Clientes & Libreta de Fiados",
      "Cobranzas por WhatsApp en 1 clic",
      "Múltiples Cajas y Roles de Cajero",
      "Soporte prioritario VIP 24/7"
    ]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_fee = EXCLUDED.monthly_fee,
  is_popular = EXCLUDED.is_popular,
  features = EXCLUDED.features,
  updated_at = NOW();

-- 2. STORE SUBSCRIPTIONS TABLE
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

-- 3. CUSTOMERS (CRM DE CLIENTES & FIADOS)
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

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read saas_plans" ON public.saas_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow all store_subscriptions" ON public.store_subscriptions
  FOR ALL USING (true);

CREATE POLICY "Allow all customers" ON public.customers
  FOR ALL USING (true);
