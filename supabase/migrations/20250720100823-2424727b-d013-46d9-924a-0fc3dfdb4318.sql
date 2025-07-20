-- Create optimized dashboard RPC function for single query performance
CREATE OR REPLACE FUNCTION get_dashboard_complete(
  p_start_date DATE,
  p_end_date DATE,
  p_platform_ids UUID[] DEFAULT NULL,
  p_store_ids UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'summary', (
      SELECT row_to_json(summary_data)
      FROM (
        SELECT 
          COUNT(*)::BIGINT as total_orders,
          SUM(st.quantity)::BIGINT as total_packages,
          SUM(st.selling_price) as total_revenue,
          SUM(st.profit) as total_profit,
          SUM(CASE WHEN st.delivery_status = 'Selesai' THEN 1 ELSE 0 END)::BIGINT as completed_orders,
          SUM(CASE WHEN st.delivery_status = 'Selesai' THEN st.selling_price ELSE 0 END) as completed_revenue,
          SUM(CASE WHEN st.delivery_status = 'Selesai' THEN st.profit ELSE 0 END) as completed_profit,
          SUM(CASE WHEN st.delivery_status = 'Sedang Dikirim' THEN 1 ELSE 0 END)::BIGINT as shipping_orders,
          SUM(CASE WHEN st.delivery_status = 'Sedang Dikirim' THEN st.selling_price ELSE 0 END) as shipping_revenue,
          SUM(CASE WHEN st.delivery_status = 'Batal' THEN 1 ELSE 0 END)::BIGINT as cancelled_orders,
          SUM(CASE WHEN st.delivery_status = 'Batal' THEN st.selling_price ELSE 0 END) as cancelled_revenue,
          SUM(CASE WHEN st.delivery_status = 'Return' THEN 1 ELSE 0 END)::BIGINT as returned_orders,
          SUM(CASE WHEN st.delivery_status = 'Return' THEN st.selling_price ELSE 0 END) as returned_revenue
        FROM sales_transactions st
        WHERE DATE(st.order_created_at) BETWEEN p_start_date AND p_end_date
          AND (p_platform_ids IS NULL OR st.platform_id = ANY(p_platform_ids))
          AND (p_store_ids IS NULL OR st.store_id = ANY(p_store_ids))
      ) summary_data
    ),
    'recent_transactions', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          st.id,
          st.order_number,
          st.product_name,
          st.delivery_status,
          st.selling_price,
          st.profit,
          st.order_created_at,
          p.platform_name,
          s.store_name
        FROM sales_transactions st
        JOIN platforms p ON st.platform_id = p.id
        JOIN stores s ON st.store_id = s.id
        WHERE DATE(st.order_created_at) BETWEEN p_start_date AND p_end_date
          AND (p_platform_ids IS NULL OR st.platform_id = ANY(p_platform_ids))
          AND (p_store_ids IS NULL OR st.store_id = ANY(p_store_ids))
        ORDER BY st.order_created_at DESC 
        LIMIT 10
      ) t
    ),
    'platform_performance', (
      SELECT json_agg(row_to_json(platform_data))
      FROM (
        SELECT 
          p.id as platform_id,
          p.platform_name,
          SUM(st.selling_price) as total_revenue,
          SUM(st.profit) as total_profit,
          COUNT(*) as total_transactions,
          CASE 
            WHEN SUM(st.selling_price) > 0 
            THEN (SUM(st.profit) / SUM(st.selling_price)) * 100 
            ELSE 0 
          END as profit_margin_percentage
        FROM sales_transactions st
        JOIN platforms p ON st.platform_id = p.id
        WHERE DATE(st.order_created_at) BETWEEN p_start_date AND p_end_date
          AND st.delivery_status = 'Selesai'
          AND (p_platform_ids IS NULL OR st.platform_id = ANY(p_platform_ids))
          AND (p_store_ids IS NULL OR st.store_id = ANY(p_store_ids))
        GROUP BY p.id, p.platform_name
        ORDER BY total_revenue DESC
      ) platform_data
    ),
    'revenue_trend', (
      SELECT json_agg(
        json_build_object(
          'date', trend_date,
          'revenue', daily_revenue,
          'profit', daily_profit,
          'transactions', daily_transactions
        )
        ORDER BY trend_date
      )
      FROM (
        SELECT 
          DATE(st.order_created_at) as trend_date,
          SUM(st.selling_price) as daily_revenue,
          SUM(st.profit) as daily_profit,
          COUNT(*) as daily_transactions
        FROM sales_transactions st
        WHERE DATE(st.order_created_at) BETWEEN p_start_date AND p_end_date
          AND st.delivery_status = 'Selesai'
          AND (p_platform_ids IS NULL OR st.platform_id = ANY(p_platform_ids))
          AND (p_store_ids IS NULL OR st.store_id = ANY(p_store_ids))
        GROUP BY DATE(st.order_created_at)
        ORDER BY DATE(st.order_created_at)
      ) daily_data
    ),
    'top_products', (
      SELECT json_agg(
        json_build_object(
          'sku_reference', product_sku,
          'product_name', product_name,
          'total_revenue', total_revenue,
          'total_profit', total_profit,
          'total_units', total_units,
          'profit_margin', profit_margin
        )
        ORDER BY total_revenue DESC
      )
      FROM (
        SELECT 
          COALESCE(st.sku_reference, 'N/A') as product_sku,
          st.product_name,
          SUM(st.selling_price) as total_revenue,
          SUM(st.profit) as total_profit,
          SUM(st.quantity) as total_units,
          CASE 
            WHEN SUM(st.selling_price) > 0 
            THEN (SUM(st.profit) / SUM(st.selling_price)) * 100 
            ELSE 0 
          END as profit_margin
        FROM sales_transactions st
        WHERE DATE(st.order_created_at) BETWEEN p_start_date AND p_end_date
          AND st.delivery_status = 'Selesai'
          AND (p_platform_ids IS NULL OR st.platform_id = ANY(p_platform_ids))
          AND (p_store_ids IS NULL OR st.store_id = ANY(p_store_ids))
        GROUP BY st.sku_reference, st.product_name
        ORDER BY total_revenue DESC
        LIMIT 10
      ) product_data
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;