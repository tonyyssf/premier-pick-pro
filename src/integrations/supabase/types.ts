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
      fixtures: {
        Row: {
          away_score: number | null
          away_team_id: string
          created_at: string
          gameweek_id: string
          home_score: number | null
          home_team_id: string
          id: string
          kickoff_time: string
          status: string
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team_id: string
          created_at?: string
          gameweek_id: string
          home_score?: number | null
          home_team_id: string
          id?: string
          kickoff_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team_id?: string
          created_at?: string
          gameweek_id?: string
          home_score?: number | null
          home_team_id?: string
          id?: string
          kickoff_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_gameweek_id_fkey"
            columns: ["gameweek_id"]
            isOneToOne: false
            referencedRelation: "gameweeks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      gameweek_scores: {
        Row: {
          created_at: string
          gameweek_id: string
          id: string
          is_correct: boolean
          points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gameweek_id: string
          id?: string
          is_correct?: boolean
          points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gameweek_id?: string
          id?: string
          is_correct?: boolean
          points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gameweek_scores_gameweek_id_fkey"
            columns: ["gameweek_id"]
            isOneToOne: false
            referencedRelation: "gameweeks"
            referencedColumns: ["id"]
          },
        ]
      }
      gameweeks: {
        Row: {
          created_at: string
          deadline: string
          end_date: string
          id: string
          is_current: boolean
          number: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline: string
          end_date: string
          id?: string
          is_current?: boolean
          number: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string
          end_date?: string
          id?: string
          is_current?: boolean
          number?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      league_members: {
        Row: {
          id: string
          joined_at: string
          league_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          league_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          league_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          invite_code: string
          is_public: boolean | null
          max_members: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          invite_code?: string
          is_public?: boolean | null
          max_members?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          invite_code?: string
          is_public?: boolean | null
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country_code: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone_number: string | null
          sms_reminders_enabled: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone_number?: string | null
          sms_reminders_enabled?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
          sms_reminders_enabled?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      sms_reminders: {
        Row: {
          gameweek_id: string
          id: string
          message_content: string
          phone_number: string
          provider_message_id: string | null
          sent_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          gameweek_id: string
          id?: string
          message_content: string
          phone_number: string
          provider_message_id?: string | null
          sent_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          gameweek_id?: string
          id?: string
          message_content?: string
          phone_number?: string
          provider_message_id?: string | null
          sent_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_reminders_gameweek_id_fkey"
            columns: ["gameweek_id"]
            isOneToOne: false
            referencedRelation: "gameweeks"
            referencedColumns: ["id"]
          },
        ]
      }
      standings: {
        Row: {
          correct_picks: number
          created_at: string
          current_rank: number
          id: string
          league_id: string | null
          total_picks: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          correct_picks?: number
          created_at?: string
          current_rank?: number
          id?: string
          league_id?: string | null
          total_picks?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          correct_picks?: number
          created_at?: string
          current_rank?: number
          id?: string
          league_id?: string | null
          total_picks?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          short_name: string
          team_color: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          short_name: string
          team_color?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          short_name?: string
          team_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_picks: {
        Row: {
          created_at: string
          fixture_id: string
          gameweek_id: string
          id: string
          picked_team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fixture_id: string
          gameweek_id: string
          id?: string
          picked_team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          fixture_id?: string
          gameweek_id?: string
          id?: string
          picked_team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_picks_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_picks_gameweek_id_fkey"
            columns: ["gameweek_id"]
            isOneToOne: false
            referencedRelation: "gameweeks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_picks_picked_team_id_fkey"
            columns: ["picked_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_refresh_rankings: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      advance_to_next_gameweek: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      audit_extension_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          extension_name: string
          schema_location: string
          security_recommendation: string
        }[]
      }
      calculate_gameweek_scores: {
        Args: { gameweek_uuid: string }
        Returns: undefined
      }
      check_extension_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          extension_name: string
          schema_name: string
          security_note: string
        }[]
      }
      check_gameweek_completion: {
        Args: { gameweek_uuid: string }
        Returns: boolean
      }
      check_ranking_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          issue_type: string
          table_name: string
          issue_count: number
          details: string
        }[]
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_league_by_invite_code: {
        Args: { p_code: string }
        Returns: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          invite_code: string
          is_public: boolean | null
          max_members: number | null
          name: string
          updated_at: string
        }[]
      }
      initialize_user_complete_standings: {
        Args: { target_user_id: string }
        Returns: string
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_league_creator: {
        Args: { _user_id: string; _league_id: string }
        Returns: boolean
      }
      is_league_member: {
        Args: { _user_id: string; _league_id: string }
        Returns: boolean
      }
      is_league_public: {
        Args: { _league_id: string }
        Returns: boolean
      }
      refresh_all_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      security_audit_log: {
        Args: Record<PropertyKey, never>
        Returns: {
          function_name: string
          schema_name: string
          is_security_definer: boolean
          search_path_set: boolean
        }[]
      }
      update_all_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "user"],
    },
  },
} as const
