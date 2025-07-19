-- Analytics Database Functions for Advanced Analytics

-- Analytics KPI Function
CREATE OR REPLACE FUNCTION get_analytics_kpi(
  p_timeframe TEXT DEFAULT '30d',
  p_platform_ids UUID[] DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  start_date DATE;
  end_date DATE;
  result JSON;
BEGIN
  -- Calculate date range
  CASE p_timeframe
    WHEN '7d' THEN 
      start_date := CURRENT_DATE - INTERVAL '7 days';
      end_date := CURRENT_DATE;
    WHEN '30d' THEN 
      start_date := CURRENT_DATE - INTERVAL '30 days';
      end_date := CURRENT_DATE;
    WHEN '90d' THEN 
      start_date := CURRENT_DATE - INTERVAL '90 days';
      end_date := CURRENT_DATE;
    WHEN '1y' THEN 
      start_date := CURRENT_DATE - INTERVAL '1 year';
      end_date := CURRENT_DATE;
    ELSE 
      start_date := CURRENT_DATE - INTERVAL '30 days';
      end_date := CURRENT_DATE;
  END CASE;
  
  SELECT json_build_object(
    'totalRevenue', COALESCE(SUM(st.selling_price * st.quantity), 0),
    'totalProfit', COALESCE(SUM(st.profit), 0),
    'profitMargin', CASE 
      WHEN SUM(st.selling_price * st.quantity) > 0 
      THEN (SUM(st.profit) / SUM(st.selling_price * st.quantity)) * 100 
      ELSE 0 
    END,
    'totalTransactions', COUNT(*),
    'avgOrderValue', CASE 
      WHEN COUNT(*) > 0 
      THEN SUM(st.selling_price * st.quantity) / COUNT(*) 
      ELSE 0 
    END,
    'topPlatform', (
      SELECT p.platform_name 
      FROM sales_transactions st2 
      JOIN platforms p ON st2.platform_id = p.id
      WHERE DATE(st2.order_created_at) BETWEEN start_date AND end_date
        AND st2.delivery_status = 'Selesai'
        AND (p_platform_ids IS NULL OR st2.platform_id = ANY(p_platform_ids))
      GROUP BY p.platform_name 
      ORDER BY SUM(st2.selling_price * st2.quantity) DESC 
      LIMIT 1
    ),
    'growthRate', (
      WITH current_period AS (
        SELECT SUM(selling_price * quantity) as revenue
        FROM sales_transactions
        WHERE DATE(order_created_at) BETWEEN start_date AND end_date
          AND delivery_status = 'Selesai'
          AND (p_platform_ids IS NULL OR platform_id = ANY(p_platform_ids))
      ),
      previous_period AS (
        SELECT SUM(selling_price * quantity) as revenue
        FROM sales_transactions
        WHERE DATE(order_created_at) BETWEEN 
          start_date - (end_date - start_date) AND 
          end_date - (end_date - start_date)
          AND delivery_status = 'Selesai'
          AND (p_platform_ids IS NULL OR platform_id = ANY(p_platform_ids))
      )
      SELECT CASE 
        WHEN pp.revenue > 0 
        THEN ((cp.revenue - pp.revenue) / pp.revenue) * 100 
        ELSE 0 
      END
      FROM current_period cp, previous_period pp
    )
  ) INTO result
  FROM sales_transactions st
  WHERE DATE(st.order_created_at) BETWEEN start_date AND end_date
    AND st.delivery_status = 'Selesai'
    AND (p_platform_ids IS NULL OR st.platform_id = ANY(p_platform_ids));
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Revenue Analytics Function
CREATE OR REPLACE FUNCTION get_revenue_analytics(
  p_timeframe TEXT DEFAULT '30d',
  p_platform_ids UUID[] DEFAULT NULL
) RETURNS TABLE (
  date DATE,
  revenue DECIMAL,
  profit DECIMAL,
  transactions BIGINT,
  margin DECIMAL
) AS $$
DECLARE
  start_date DATE;
  end_date DATE;
BEGIN
  -- Calculate date range
  CASE p_timeframe
    WHEN '7d' THEN 
      start_date := CURRENT_DATE - INTERVAL '7 days';
      end_date := CURRENT_DATE;
    WHEN '30d' THEN 
      start_date := CURRENT_DATE - INTERVAL '30 days';
      end_date := CURRENT_DATE;
    WHEN '90d' THEN 
      start_date := CURRENT_DATE - INTERVAL '90 days';
      end_date := CURRENT_DATE;
    WHEN '1y' THEN 
      start_date := CURRENT_DATE - INTERVAL '1 year';
      end_date := CURRENT_DATE;
    ELSE 
      start_date := CURRENT_DATE - INTERVAL '30 days';
      end_date := CURRENT_DATE;
  END CASE;
  
  RETURN QUERY
  SELECT 
    DATE(st.order_created_at) as date,
    SUM(st.selling_price * st.quantity) as revenue,
    SUM(st.profit) as profit,
    COUNT(*) as transactions,
    CASE 
      WHEN SUM(st.selling_price * st.quantity) > 0 
      THEN (SUM(st.profit) / SUM(st.selling_price * st.quantity)) * 100 
      ELSE 0 
    END as margin
  FROM sales_transactions st
  WHERE DATE(st.order_created_at) BETWEEN start_date AND end_date
    AND st.delivery_status = 'Selesai'
    AND (p_platform_ids IS NULL OR st.platform_id = ANY(p_platform_ids))
  GROUP BY DATE(st.order_created_at)
  ORDER BY DATE(st.order_created_at);
END;
$$ LANGUAGE plpgsql;

-- Platform Performance Function
CREATE OR REPLACE FUNCTION get_platform_performance(
  p_timeframe TEXT DEFAULT '30d',
  p_platform_ids UUID[] DEFAULT NULL
) RETURNS TABLE (
  platform_name VARCHAR,
  revenue DECIMAL,
  profit DECIMAL,
  margin DECIMAL,
  transactions BIGINT
) AS $$
DECLARE
  start_date DATE;
  end_date DATE;
BEGIN
  -- Date range calculation
  CASE p_timeframe
    WHEN '7d' THEN 
      start_date := CURRENT_DATE - INTERVAL '7 days';
      end_date := CURRENT_DATE;
    WHEN '30d' THEN 
      start_date := CURRENT_DATE - INTERVAL '30 days';
      end_date := CURRENT_DATE;
    WHEN '90d' THEN 
      start_date := CURRENT_DATE - INTERVAL '90 days';
      end_date := CURRENT_DATE;
    WHEN '1y' THEN 
      start_date := CURRENT_DATE - INTERVAL '1 year';
      end_date := CURRENT_DATE;
    ELSE 
      start_date := CURRENT_DATE - INTERVAL '30 days';
      end_date := CURRENT_DATE;
  END CASE;
  
  RETURN QUERY
  SELECT 
    p.platform_name,
    SUM(st.selling_price * st.quantity) as revenue,
    SUM(st.profit) as profit,
    CASE 
      WHEN SUM(st.selling_price * st.quantity) > 0 
      THEN (SUM(st.profit) / SUM(st.selling_price * st.quantity)) * 100 
      ELSE 0 
    END as margin,
    COUNT(*) as transactions
  FROM sales_transactions st
  JOIN platforms p ON st.platform_id = p.id
  WHERE DATE(st.order_created_at) BETWEEN start_date AND end_date
    AND st.delivery_status = 'Selesai'
    AND (p_platform_ids IS NULL OR st.platform_id = ANY(p_platform_ids))
  GROUP BY p.platform_name, p.id
  ORDER BY SUM(st.selling_price * st.quantity) DESC;
END;
$$ LANGUAGE plpgsql;

-- Product Performance Function
CREATE OR REPLACE FUNCTION get_product_performance(
  p_timeframe TEXT DEFAULT '30d',
  p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
  sku_reference VARCHAR,
  product_name VARCHAR,
  total_revenue DECIMAL,
  total_profit DECIMAL,
  total_units BIGINT,
  margin DECIMAL
) AS $$
DECLARE
  start_date DATE;
  end_date DATE;
BEGIN
  CASE p_timeframe
    WHEN '7d' THEN 
      start_date := CURRENT_DATE - INTERVAL '7 days';
      end_date := CURRENT_DATE;
    WHEN '30d' THEN 
      start_date := CURRENT_DATE - INTERVAL '30 days';
      end_date := CURRENT_DATE;
    WHEN '90d' THEN 
      start_date := CURRENT_DATE - INTERVAL '90 days';
      end_date := CURRENT_DATE;
    WHEN '1y' THEN 
      start_date := CURRENT_DATE - INTERVAL '1 year';
      end_date := CURRENT_DATE;
    ELSE 
      start_date := CURRENT_DATE - INTERVAL '30 days';
      end_date := CURRENT_DATE;
  END CASE;
  
  RETURN QUERY
  SELECT 
    COALESCE(st.sku_reference, 'N/A') as sku_reference,
    st.product_name,
    SUM(st.selling_price * st.quantity) as total_revenue,
    SUM(st.profit) as total_profit,
    SUM(st.quantity) as total_units,
    CASE 
      WHEN SUM(st.selling_price * st.quantity) > 0 
      THEN (SUM(st.profit) / SUM(st.selling_price * st.quantity)) * 100 
      ELSE 0 
    END as margin
  FROM sales_transactions st
  WHERE DATE(st.order_created_at) BETWEEN start_date AND end_date
    AND st.delivery_status = 'Selesai'
  GROUP BY st.sku_reference, st.product_name
  ORDER BY SUM(st.selling_price * st.quantity) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;