export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_data: {
        Row: {
          created_at: string | null
          data_pull_frequency: Json | null
          data_size: Json | null
          etl_extraction: number | null
          etl_loading: number | null
          etl_transformation: number | null
          id: string
          last_updated: string | null
          upload_success_rate: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_pull_frequency?: Json | null
          data_size?: Json | null
          etl_extraction?: number | null
          etl_loading?: number | null
          etl_transformation?: number | null
          id?: string
          last_updated?: string | null
          upload_success_rate?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_pull_frequency?: Json | null
          data_size?: Json | null
          etl_extraction?: number | null
          etl_loading?: number | null
          etl_transformation?: number | null
          id?: string
          last_updated?: string | null
          upload_success_rate?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          name: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_metrics: {
        Row: {
          id: string
          last_updated: string | null
          metric_name: string
          metric_value: number
          user_id: string
        }
        Insert: {
          id?: string
          last_updated?: string | null
          metric_name: string
          metric_value: number
          user_id: string
        }
        Update: {
          id?: string
          last_updated?: string | null
          metric_name?: string
          metric_value?: number
          user_id?: string
        }
        Relationships: []
      }
      destination_logs: {
        Row: {
          created_at: string | null
          destination_id: string | null
          details: Json | null
          event_type: string
          id: string
          message: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          destination_id?: string | null
          details?: Json | null
          event_type: string
          id?: string
          message?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          destination_id?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          message?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destination_logs_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          config: Json
          created_at: string | null
          destination_type: string | null
          export_format: string | null
          id: string
          last_export: string | null
          name: string
          schedule: string | null
          status: string | null
          storage_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          destination_type?: string | null
          export_format?: string | null
          id?: string
          last_export?: string | null
          name: string
          schedule?: string | null
          status?: string | null
          storage_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          destination_type?: string | null
          export_format?: string | null
          id?: string
          last_export?: string | null
          name?: string
          schedule?: string | null
          status?: string | null
          storage_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      export_logs: {
        Row: {
          destination_id: string | null
          error_message: string | null
          exported_at: string | null
          file_size: number | null
          file_url: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          destination_id?: string | null
          error_message?: string | null
          exported_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          destination_id?: string | null
          error_message?: string | null
          exported_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "export_logs_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          slug: string | null
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          slug?: string | null
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          slug?: string | null
          title?: string
        }
        Relationships: []
      }
      help_images: {
        Row: {
          article_id: string | null
          created_at: string | null
          file_path: string
          id: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          file_path: string
          id?: string
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          file_path?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_images_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "help_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      help_search_logs: {
        Row: {
          id: string
          query: string
          search_date: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          query: string
          search_date?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          query?: string
          search_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      job_runs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          job_id: string
          rows_processed: number | null
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          rows_processed?: number | null
          started_at?: string
          status: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          rows_processed?: number | null
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      job_summary: {
        Row: {
          failed_jobs: number
          id: string
          last_updated: string | null
          successful_jobs: number
          total_jobs: number
          user_id: string
        }
        Insert: {
          failed_jobs?: number
          id?: string
          last_updated?: string | null
          successful_jobs?: number
          total_jobs?: number
          user_id: string
        }
        Update: {
          failed_jobs?: number
          id?: string
          last_updated?: string | null
          successful_jobs?: number
          total_jobs?: number
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          created_at: string | null
          description: string | null
          destination_id: string | null
          duration: unknown | null
          frequency: string | null
          id: string
          job_type: string | null
          last_run: string | null
          name: string | null
          next_run: string | null
          rows_processed: number | null
          schedule: string | null
          source_id: string | null
          source_name: string
          start_date: string | null
          status: string | null
          transformation_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          destination_id?: string | null
          duration?: unknown | null
          frequency?: string | null
          id?: string
          job_type?: string | null
          last_run?: string | null
          name?: string | null
          next_run?: string | null
          rows_processed?: number | null
          schedule?: string | null
          source_id?: string | null
          source_name: string
          start_date?: string | null
          status?: string | null
          transformation_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          destination_id?: string | null
          duration?: unknown | null
          frequency?: string | null
          id?: string
          job_type?: string | null
          last_run?: string | null
          name?: string | null
          next_run?: string | null
          rows_processed?: number | null
          schedule?: string | null
          source_id?: string | null
          source_name?: string
          start_date?: string | null
          status?: string | null
          transformation_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          link: string | null
          read: boolean
          related_id: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          link?: string | null
          read?: boolean
          related_id?: string | null
          severity: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          link?: string | null
          read?: boolean
          related_id?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_steps: {
        Row: {
          created_at: string | null
          description: string
          element_selector: string
          id: string
          position: string
          step_order: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          element_selector: string
          id?: string
          position?: string
          step_order: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          element_selector?: string
          id?: string
          position?: string
          step_order?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auto_logout_minutes: number | null
          company: string | null
          created_at: string | null
          dark_mode: boolean | null
          dismissed_help_messages: Json | null
          first_name: string | null
          id: string
          language: string | null
          last_name: string | null
          notifications_enabled: boolean | null
          onboarding_completed: boolean | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          auto_logout_minutes?: number | null
          company?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          dismissed_help_messages?: Json | null
          first_name?: string | null
          id: string
          language?: string | null
          last_name?: string | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_logout_minutes?: number | null
          company?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          dismissed_help_messages?: Json | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shopify_credentials: {
        Row: {
          api_key: string
          api_token: string
          created_at: string | null
          id: string
          last_connection_status: boolean | null
          last_connection_time: string | null
          store_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          api_token: string
          created_at?: string | null
          id?: string
          last_connection_status?: boolean | null
          last_connection_time?: string | null
          store_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          api_token?: string
          created_at?: string | null
          id?: string
          last_connection_status?: boolean | null
          last_connection_time?: string | null
          store_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shopify_logs: {
        Row: {
          api_key: string | null
          created_at: string
          error_details: Json | null
          error_message: string | null
          http_status: number | null
          id: string
          store_name: string
          user_id: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          error_details?: Json | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          store_name: string
          user_id?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string
          error_details?: Json | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          store_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sources: {
        Row: {
          created_at: string | null
          credentials: Json
          deletion_marked_at: string | null
          id: string
          is_deleted: boolean
          last_sync: string | null
          name: string
          source_type: string
          status: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credentials: Json
          deletion_marked_at?: string | null
          id?: string
          is_deleted?: boolean
          last_sync?: string | null
          name: string
          source_type: string
          status: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          credentials?: Json
          deletion_marked_at?: string | null
          id?: string
          is_deleted?: boolean
          last_sync?: string | null
          name?: string
          source_type?: string
          status?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      storage_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transformations: {
        Row: {
          created_at: string | null
          expression: string | null
          id: string
          last_modified: string | null
          name: string
          skip_transformation: boolean | null
          source_id: string
          source_name: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expression?: string | null
          id?: string
          last_modified?: string | null
          name: string
          skip_transformation?: boolean | null
          source_id: string
          source_name: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expression?: string | null
          id?: string
          last_modified?: string | null
          name?: string
          skip_transformation?: boolean | null
          source_id?: string
          source_name?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_security: {
        Row: {
          created_at: string | null
          id: string
          last_password_change: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_password_change?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_password_change?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhook_triggers: {
        Row: {
          id: string
          response_body: string | null
          response_code: number | null
          status: string
          triggered_at: string | null
          webhook_id: string
        }
        Insert: {
          id?: string
          response_body?: string | null
          response_code?: number | null
          status: string
          triggered_at?: string | null
          webhook_id: string
        }
        Update: {
          id?: string
          response_body?: string | null
          response_code?: number | null
          status?: string
          triggered_at?: string | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_triggers_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          active: boolean | null
          created_at: string | null
          endpoint_url: string
          event_type: string
          id: string
          last_triggered_at: string | null
          name: string
          secret_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          endpoint_url: string
          event_type: string
          id?: string
          last_triggered_at?: string | null
          name: string
          secret_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          endpoint_url?: string
          event_type?: string
          id?: string
          last_triggered_at?: string | null
          name?: string
          secret_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_old_marked_sources: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      dismiss_help_message: {
        Args: {
          message_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          user_id: string
          requested_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      reset_dismissed_help_messages: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      test_shopify_connection: {
        Args: {
          store_url: string
          token: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
