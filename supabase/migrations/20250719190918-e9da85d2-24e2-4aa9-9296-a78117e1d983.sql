-- Add sample transaction data since we already have platforms, stores, and products
-- First get the IDs we need
WITH sample_data AS (
  SELECT 
    p.id as platform_id,
    p.platform_name,
    s.id as store_id,
    s.store_name,
    pr.sku_reference,
    pr.product_name,
    pr.base_cost
  FROM platforms p
  JOIN stores s ON p.id = s.platform_id
  JOIN products pr ON true
  WHERE p.is_active = true AND s.is_active = true AND pr.is_active = true
  LIMIT 50
),
random_transactions AS (
  SELECT 
    sd.platform_id,
    sd.store_id,
    sd.sku_reference,
    sd.product_name,
    sd.base_cost,
    sd.platform_name,
    -- Generate random order data
    'ORDER-' || sd.platform_name || '-' || (random() * 1000000)::int::text as order_number,
    'MAN-' || (random() * 1000000)::int::text as manual_order_number,
    CASE 
      WHEN random() < 0.1 THEN 'J&T Express'
      WHEN random() < 0.2 THEN 'JNE'
      WHEN random() < 0.3 THEN 'SiCepat'
      WHEN random() < 0.4 THEN 'AnterAja'
      ELSE 'Grab Express'
    END as expedition,
    CASE 
      WHEN random() < 0.7 THEN 'Selesai'
      WHEN random() < 0.85 THEN 'Sedang Dikirim'
      WHEN random() < 0.95 THEN 'Batal'
      ELSE 'Return'
    END as delivery_status,
    'TRACK-' || (random() * 1000000000)::bigint::text as tracking_number,
    -- Random dates within last 3 months
    (CURRENT_DATE - (random() * 90)::int * interval '1 day')::timestamp + 
    (random() * interval '24 hours') as order_created_at,
    -- Random quantities and prices
    (1 + random() * 3)::int as quantity,
    sd.base_cost * (1.3 + random() * 0.7) as selling_price,
    'Admin Store' as pic_name
  FROM sample_data sd
  CROSS JOIN generate_series(1, 10) -- Generate 10 transactions per product
)
INSERT INTO public.sales_transactions (
  pic_name,
  platform_id,
  store_id,
  order_number,
  manual_order_number,
  expedition,
  delivery_status,
  product_name,
  tracking_number,
  order_created_at,
  cost_price,
  selling_price,
  sku_reference,
  quantity,
  profit
)
SELECT 
  rt.pic_name,
  rt.platform_id,
  rt.store_id,
  rt.order_number,
  rt.manual_order_number,
  rt.expedition,
  rt.delivery_status,
  rt.product_name,
  rt.tracking_number,
  rt.order_created_at,
  rt.base_cost,
  rt.selling_price,
  rt.sku_reference,
  rt.quantity,
  (rt.selling_price - rt.base_cost) * rt.quantity as profit
FROM random_transactions rt;