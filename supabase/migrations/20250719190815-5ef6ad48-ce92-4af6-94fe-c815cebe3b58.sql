-- Enable Row Level Security on all tables that don't have it
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to be more secure and consistent
-- Remove overly permissive policies and replace with proper ones

-- Clean up existing policies first
DROP POLICY IF EXISTS "Allow authenticated users" ON public.platforms;
DROP POLICY IF EXISTS "Allow authenticated users" ON public.stores;
DROP POLICY IF EXISTS "Allow authenticated users" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users" ON public.sales_transactions;
DROP POLICY IF EXISTS "Allow authenticated users" ON public.upload_batches;
DROP POLICY IF EXISTS "Allow authenticated users" ON public.ad_expenses;
DROP POLICY IF EXISTS "Allow authenticated users" ON public.audit_logs;

-- Platforms - Read access for authenticated users, write for admins
CREATE POLICY "Platforms read access" ON public.platforms
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Platforms write access" ON public.platforms
FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::text, 'admin'::text]));

-- Stores - Read access for authenticated users, write for admins
CREATE POLICY "Stores read access" ON public.stores
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Stores write access" ON public.stores
FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::text, 'admin'::text]));

-- Products - Read access for authenticated users, write for admins
CREATE POLICY "Products read access" ON public.products
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Products write access" ON public.products
FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::text, 'admin'::text]));

-- Sales Transactions - Keep existing policies but ensure they're properly structured
-- Upload Batches - Keep existing user-based access
-- Ad Expenses - Keep existing user-based access
-- Audit Logs - Read only for super admins
CREATE POLICY "Audit logs access" ON public.audit_logs
FOR SELECT USING (get_user_role(auth.uid()) = 'super_admin'::text);

-- Insert sample platforms data
INSERT INTO public.platforms (platform_name, platform_code, is_active) VALUES
('Shopee', 'SHOPEE', true),
('TikTok Shop', 'TIKTOK', true),
('Tokopedia', 'TOKPED', true),
('Lazada', 'LAZADA', true),
('Blibli', 'BLIBLI', true)
ON CONFLICT (platform_code) DO NOTHING;

-- Insert sample stores data
WITH platform_ids AS (
  SELECT id, platform_code FROM platforms WHERE is_active = true
)
INSERT INTO public.stores (store_id_external, store_name, platform_id, pic_name, is_active) 
SELECT 
  CASE p.platform_code
    WHEN 'SHOPEE' THEN 'shopee_' || generate_random_uuid()::text
    WHEN 'TIKTOK' THEN 'tiktok_' || generate_random_uuid()::text
    WHEN 'TOKPED' THEN 'tokped_' || generate_random_uuid()::text
    WHEN 'LAZADA' THEN 'lazada_' || generate_random_uuid()::text
    WHEN 'BLIBLI' THEN 'blibli_' || generate_random_uuid()::text
  END as store_id_external,
  CASE p.platform_code
    WHEN 'SHOPEE' THEN 'Toko Prima Shopee'
    WHEN 'TIKTOK' THEN 'Prima Store TikTok'
    WHEN 'TOKPED' THEN 'Prima Shop Tokopedia'
    WHEN 'LAZADA' THEN 'Prima Store Lazada'
    WHEN 'BLIBLI' THEN 'Prima Shop Blibli'
  END as store_name,
  p.id as platform_id,
  'Admin Store' as pic_name,
  true as is_active
FROM platform_ids p
ON CONFLICT (store_id_external) DO NOTHING;

-- Insert sample products data
INSERT INTO public.products (product_name, sku_reference, category, base_cost, is_active) VALUES
('Smartphone Samsung Galaxy A54', 'PHONE-SAM-A54', 'Electronics', 3500000, true),
('Laptop ASUS VivoBook 14', 'LAPTOP-ASUS-VB14', 'Electronics', 7500000, true),
('Kemeja Formal Pria Premium', 'CLOTH-SHIRT-PREM', 'Fashion', 150000, true),
('Sepatu Sneakers Nike Air', 'SHOES-NIKE-AIR', 'Fashion', 800000, true),
('Tas Ransel Travel Multi', 'BAG-TRAVEL-MULTI', 'Travel', 250000, true),
('Headphone Bluetooth Sony', 'AUDIO-SONY-BT', 'Electronics', 450000, true),
('Jaket Hoodie Unisex', 'CLOTH-HOODIE-UNI', 'Fashion', 180000, true),
('Power Bank 20000mAh Fast', 'ELEC-PB-20K', 'Electronics', 120000, true),
('Jam Tangan Sport Digital', 'WATCH-SPORT-DIG', 'Fashion', 300000, true),
('Speaker Portable JBL', 'AUDIO-JBL-PORT', 'Electronics', 650000, true)
ON CONFLICT (sku_reference) DO NOTHING;