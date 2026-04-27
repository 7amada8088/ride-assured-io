export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          id: string
          price: number
          seat_number: number
          status: Database["public"]["Enums"]["booking_status"]
          trip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price?: number
          seat_number: number
          status?: Database["public"]["Enums"]["booking_status"]
          trip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          seat_number?: number
          status?: Database["public"]["Enums"]["booking_status"]
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          license_no: string | null
          rating: number | null
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          license_no?: string | null
          rating?: number | null
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          license_no?: string | null
          rating?: number | null
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          reference_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          type: Database["public"]["Enums"]["payment_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          type: Database["public"]["Enums"]["payment_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          type?: Database["public"]["Enums"]["payment_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          base_price: number
          created_at: string
          destination: string
          distance_km: number | null
          estimated_duration_min: number
          id: string
          is_active: boolean
          is_dynamic: boolean
          name: string
          origin: string
          stops: Json
        }
        Insert: {
          base_price?: number
          created_at?: string
          destination: string
          distance_km?: number | null
          estimated_duration_min?: number
          id?: string
          is_active?: boolean
          is_dynamic?: boolean
          name: string
          origin: string
          stops?: Json
        }
        Update: {
          base_price?: number
          created_at?: string
          destination?: string
          distance_km?: number | null
          estimated_duration_min?: number
          id?: string
          is_active?: boolean
          is_dynamic?: boolean
          name?: string
          origin?: string
          stops?: Json
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          price: number
          route_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          price?: number
          route_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          price?: number
          route_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          arrival_time: string | null
          available_seats: number
          created_at: string
          current_lat: number | null
          current_lng: number | null
          departure_time: string
          driver_id: string | null
          id: string
          route_id: string
          status: Database["public"]["Enums"]["trip_status"]
          total_seats: number
          vehicle_id: string | null
        }
        Insert: {
          arrival_time?: string | null
          available_seats?: number
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          departure_time: string
          driver_id?: string | null
          id?: string
          route_id: string
          status?: Database["public"]["Enums"]["trip_status"]
          total_seats?: number
          vehicle_id?: string | null
        }
        Update: {
          arrival_time?: string | null
          available_seats?: number
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          departure_time?: string
          driver_id?: string | null
          id?: string
          route_id?: string
          status?: Database["public"]["Enums"]["trip_status"]
          total_seats?: number
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          capacity: number
          created_at: string
          id: string
          model: string | null
          plate_number: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          model?: string | null
          plate_number: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          model?: string | null
          plate_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_seat: {
        Args: { _trip_id: string }
        Returns: {
          created_at: string
          id: string
          price: number
          seat_number: number
          status: Database["public"]["Enums"]["booking_status"]
          trip_id: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "driver" | "commuter"
      booking_status: "confirmed" | "cancelled" | "completed" | "no_show"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      payment_type: "booking" | "subscription"
      subscription_plan: "weekly" | "monthly"
      subscription_status: "active" | "expired" | "cancelled"
      trip_status: "scheduled" | "in_progress" | "completed" | "cancelled"
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
    Enums: {
      app_role: ["admin", "driver", "commuter"],
      booking_status: ["confirmed", "cancelled", "completed", "no_show"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      payment_type: ["booking", "subscription"],
      subscription_plan: ["weekly", "monthly"],
      subscription_status: ["active", "expired", "cancelled"],
      trip_status: ["scheduled", "in_progress", "completed", "cancelled"],
    },
  },
} as const
