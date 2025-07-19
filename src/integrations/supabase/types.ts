export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_expenses: {
        Row: {
          amount: number
          campaign_name: string | null
          created_at: string | null
          created_by: string
          expense_date: string
          id: string
          notes: string | null
          platform_id: string
          store_id: string | null
        }
        Insert: {
          amount: number
          campaign_name?: string | null
          created_at?: string | null
          created_by: string
          expense_date: string
          id?: string
          notes?: string | null
          platform_id: string
          store_id?: string | null
        }
        Update: {
          amount?: number
          campaign_name?: string | null
          created_at?: string | null
          created_by?: string
          expense_date?: string
          id?: string
          notes?: string | null
          platform_id?: string
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_expenses_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_expenses_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_summary"
            referencedColumns: ["platform_id"]
          },
          {
            foreignKeyName: "ad_expenses_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "v_platform_analytics"
            referencedColumns: ["platform_id"]
          },
          {
            foreignKeyName: "ad_expenses_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_expenses_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_summary"
            referencedColumns: ["store_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform_code: string
          platform_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform_code: string
          platform_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform_code?: string
          platform_name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          base_cost: number | null
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          product_name: string
          sku_reference: string
          updated_at: string | null
        }
        Insert: {
          base_cost?: number | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_name: string
          sku_reference: string
          updated_at?: string | null
        }
        Update: {
          base_cost?: number | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_name?: string
          sku_reference?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sales_transactions: {
        Row: {
          cost_price: number
          created_at: string | null
          delivery_status: string
          expedition: string | null
          id: string
          manual_order_number: string | null
          order_created_at: string
          order_number: string
          pic_name: string
          platform_id: string
          product_name: string
          profit: number | null
          quantity: number
          selling_price: number
          sku_reference: string | null
          store_id: string
          tracking_number: string | null
          updated_at: string | null
          upload_batch_id: string | null
        }
        Insert: {
          cost_price?: number
          created_at?: string | null
          delivery_status: string
          expedition?: string | null
          id?: string
          manual_order_number?: string | null
          order_created_at: string
          order_number: string
          pic_name: string
          platform_id: string
          product_name: string
          profit?: number | null
          quantity?: number
          selling_price?: number
          sku_reference?: string | null
          store_id: string
          tracking_number?: string | null
          updated_at?: string | null
          upload_batch_id?: string | null
        }
        Update: {
          cost_price?: number
          created_at?: string | null
          delivery_status?: string
          expedition?: string | null
          id?: string
          manual_order_number?: string | null
          order_created_at?: string
          order_number?: string
          pic_name?: string
          platform_id?: string
          product_name?: string
          profit?: number | null
          quantity?: number
          selling_price?: number
          sku_reference?: string | null
          store_id?: string
          tracking_number?: string | null
          updated_at?: string | null
          upload_batch_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_transactions_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_transactions_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_summary"
            referencedColumns: ["platform_id"]
          },
          {
            foreignKeyName: "sales_transactions_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "v_platform_analytics"
            referencedColumns: ["platform_id"]
          },
          {
            foreignKeyName: "sales_transactions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_transactions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_summary"
            referencedColumns: ["store_id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          pic_name: string | null
          platform_id: string | null
          store_id_external: string
          store_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pic_name?: string | null
          platform_id?: string | null
          store_id_external: string
          store_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pic_name?: string | null
          platform_id?: string | null
          store_id_external?: string
          store_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_summary"
            referencedColumns: ["platform_id"]
          },
          {
            foreignKeyName: "stores_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "v_platform_analytics"
            referencedColumns: ["platform_id"]
          },
        ]
      }
      upload_batches: {
        Row: {
          duplicate_rows: number
          error_log: Json | null
          failed_rows: number
          filename: string
          id: string
          processed_rows: number
          processing_time_seconds: number | null
          status: string
          total_rows: number
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          duplicate_rows?: number
          error_log?: Json | null
          failed_rows?: number
          filename: string
          id?: string
          processed_rows?: number
          processing_time_seconds?: number | null
          status?: string
          total_rows?: number
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          duplicate_rows?: number
          error_log?: Json | null
          failed_rows?: number
          filename?: string
          id?: string
          processed_rows?: number
          processing_time_seconds?: number | null
          status?: string
          total_rows?: number
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_batches_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_dashboard_summary: {
        Row: {
          avg_profit_per_transaction: number | null
          avg_revenue_per_transaction: number | null
          delivery_status: string | null
          period_day: string | null
          period_month: string | null
          platform_id: string | null
          platform_name: string | null
          store_id: string | null
          store_name: string | null
          total_profit: number | null
          total_quantity: number | null
          total_revenue: number | null
          transaction_count: number | null
        }
        Relationships: []
      }
      v_monthly_trends: {
        Row: {
          avg_order_value: number | null
          month: number | null
          month_start: string | null
          platform_name: string | null
          profit: number | null
          revenue: number | null
          total_orders: number | null
          total_packages: number | null
          unique_products_sold: number | null
          year: number | null
        }
        Relationships: []
      }
      v_platform_analytics: {
        Row: {
          active_days: number | null
          avg_transaction_value: number | null
          completed_profit: number | null
          completed_revenue: number | null
          completion_rate_percentage: number | null
          platform_id: string | null
          platform_name: string | null
          profit_margin_percentage: number | null
          total_packages: number | null
          total_profit: number | null
          total_revenue: number | null
          total_stores: number | null
          total_transactions: number | null
        }
        Relationships: []
      }
      v_product_performance: {
        Row: {
          avg_profit_per_sale: number | null
          category: string | null
          completed_profit: number | null
          completed_quantity: number | null
          completed_revenue: number | null
          first_sale_date: string | null
          last_sale_date: string | null
          platforms_sold_on: number | null
          product_name: string | null
          profit_margin_percentage: number | null
          sku_reference: string | null
          total_quantity_sold: number | null
          total_sales: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_duplicate_transaction: {
        Args: {
          p_order_number: string
          p_manual_order_number: string
          p_platform_id: string
          p_product_name: string
          p_order_date: string
        }
        Returns: boolean
      }
      cleanup_old_data: {
        Args: { months_to_keep?: number }
        Returns: number
      }
      get_ai_insights: {
        Args: { p_start_date?: string; p_end_date?: string }
        Returns: Json
      }
      get_dashboard_summary: {
        Args: {
          start_date?: string
          end_date?: string
          platform_ids?: string[]
          store_ids?: string[]
        }
        Returns: {
          total_orders: number
          total_packages: number
          total_revenue: number
          total_profit: number
          completed_orders: number
          completed_revenue: number
          completed_profit: number
          shipping_orders: number
          shipping_revenue: number
          cancelled_orders: number
          cancelled_revenue: number
          returned_orders: number
          returned_revenue: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      process_csv_data: {
        Args: { p_batch_id: string; p_csv_data: Json[] }
        Returns: {
          success_count: number
          duplicate_count: number
          error_count: number
          error_details: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
