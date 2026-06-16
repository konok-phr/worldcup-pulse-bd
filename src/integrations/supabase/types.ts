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
      commentary: {
        Row: {
          created_at: string
          id: number
          match_id: number
          message: string
          minute: number | null
          username: string
        }
        Insert: {
          created_at?: string
          id?: never
          match_id: number
          message: string
          minute?: number | null
          username: string
        }
        Update: {
          created_at?: string
          id?: never
          match_id?: number
          message?: string
          minute?: number | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "commentary_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      groups_2026: {
        Row: {
          letter: string
          name: string
        }
        Insert: {
          letter: string
          name: string
        }
        Update: {
          letter?: string
          name?: string
        }
        Relationships: []
      }
      live_tv_channels: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          sort_order: number
          stream_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          sort_order?: number
          stream_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          sort_order?: number
          stream_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          added_time: number | null
          assist_name: string | null
          created_at: string
          detail: string | null
          event_type: string
          id: number
          match_id: number
          minute: number
          player_name: string | null
          team_code: string | null
        }
        Insert: {
          added_time?: number | null
          assist_name?: string | null
          created_at?: string
          detail?: string | null
          event_type: string
          id?: number
          match_id: number
          minute: number
          player_name?: string | null
          team_code?: string | null
        }
        Update: {
          added_time?: number | null
          assist_name?: string | null
          created_at?: string
          detail?: string | null
          event_type?: string
          id?: number
          match_id?: number
          minute?: number
          player_name?: string | null
          team_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          attendance: number | null
          away_pens: number | null
          away_score: number | null
          away_score_ht: number | null
          away_team_code: string | null
          away_team_name: string | null
          created_at: string
          external_id: string | null
          group_letter: string | null
          home_pens: number | null
          home_score: number | null
          home_score_ht: number | null
          home_team_code: string | null
          home_team_name: string | null
          id: number
          kickoff_utc: string | null
          last_synced_at: string | null
          matchday: number | null
          minute: number | null
          referee: string | null
          stadium_slug: string | null
          stage: string
          status: string
          tournament_year: number
        }
        Insert: {
          attendance?: number | null
          away_pens?: number | null
          away_score?: number | null
          away_score_ht?: number | null
          away_team_code?: string | null
          away_team_name?: string | null
          created_at?: string
          external_id?: string | null
          group_letter?: string | null
          home_pens?: number | null
          home_score?: number | null
          home_score_ht?: number | null
          home_team_code?: string | null
          home_team_name?: string | null
          id?: number
          kickoff_utc?: string | null
          last_synced_at?: string | null
          matchday?: number | null
          minute?: number | null
          referee?: string | null
          stadium_slug?: string | null
          stage: string
          status?: string
          tournament_year: number
        }
        Update: {
          attendance?: number | null
          away_pens?: number | null
          away_score?: number | null
          away_score_ht?: number | null
          away_team_code?: string | null
          away_team_name?: string | null
          created_at?: string
          external_id?: string | null
          group_letter?: string | null
          home_pens?: number | null
          home_score?: number | null
          home_score_ht?: number | null
          home_team_code?: string | null
          home_team_name?: string | null
          id?: number
          kickoff_utc?: string | null
          last_synced_at?: string | null
          matchday?: number | null
          minute?: number | null
          referee?: string | null
          stadium_slug?: string | null
          stage?: string
          status?: string
          tournament_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_code_fkey"
            columns: ["away_team_code"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "matches_home_team_code_fkey"
            columns: ["home_team_code"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "matches_stadium_slug_fkey"
            columns: ["stadium_slug"]
            isOneToOne: false
            referencedRelation: "stadiums"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "matches_tournament_year_fkey"
            columns: ["tournament_year"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["year"]
          },
        ]
      }
      page_visits: {
        Row: {
          country: string | null
          country_code: string | null
          id: string
          path: string | null
          session_id: string | null
          user_agent: string | null
          visit_date: string
          visited_at: string
        }
        Insert: {
          country?: string | null
          country_code?: string | null
          id?: string
          path?: string | null
          session_id?: string | null
          user_agent?: string | null
          visit_date?: string
          visited_at?: string
        }
        Update: {
          country?: string | null
          country_code?: string | null
          id?: string
          path?: string | null
          session_id?: string | null
          user_agent?: string | null
          visit_date?: string
          visited_at?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          assists: number | null
          club: string | null
          created_at: string
          date_of_birth: string | null
          goals: number | null
          height_cm: number | null
          id: number
          image_url: string | null
          is_captain: boolean | null
          jersey_number: number | null
          minutes_played: number | null
          name: string
          position: string | null
          red_cards: number | null
          team_code: string | null
          tournament_year: number | null
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          club?: string | null
          created_at?: string
          date_of_birth?: string | null
          goals?: number | null
          height_cm?: number | null
          id?: number
          image_url?: string | null
          is_captain?: boolean | null
          jersey_number?: number | null
          minutes_played?: number | null
          name: string
          position?: string | null
          red_cards?: number | null
          team_code?: string | null
          tournament_year?: number | null
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          club?: string | null
          created_at?: string
          date_of_birth?: string | null
          goals?: number | null
          height_cm?: number | null
          id?: number
          image_url?: string | null
          is_captain?: boolean | null
          jersey_number?: number | null
          minutes_played?: number | null
          name?: string
          position?: string | null
          red_cards?: number | null
          team_code?: string | null
          tournament_year?: number | null
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_code_fkey"
            columns: ["team_code"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["code"]
          },
        ]
      }
      predictions: {
        Row: {
          created_at: string
          id: string
          match_id: number
          points: number
          predicted_away: number
          predicted_home: number
          scored: boolean
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: number
          points?: number
          predicted_away: number
          predicted_home: number
          scored?: boolean
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: number
          points?: number
          predicted_away?: number
          predicted_home?: number
          scored?: boolean
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      records: {
        Row: {
          category: string
          created_at: string
          description: string | null
          holder: string
          id: number
          sort_order: number | null
          title: string
          value: string
          year: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          holder: string
          id?: number
          sort_order?: number | null
          title: string
          value: string
          year?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          holder?: string
          id?: number
          sort_order?: number | null
          title?: string
          value?: string
          year?: number | null
        }
        Relationships: []
      }
      stadiums: {
        Row: {
          capacity: number | null
          city: string
          country: string
          country_code: string | null
          created_at: string
          description: string | null
          image_url: string | null
          is_wc26: boolean | null
          lat: number | null
          lng: number | null
          name: string
          opened_year: number | null
          slug: string
        }
        Insert: {
          capacity?: number | null
          city: string
          country: string
          country_code?: string | null
          created_at?: string
          description?: string | null
          image_url?: string | null
          is_wc26?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          opened_year?: number | null
          slug: string
        }
        Update: {
          capacity?: number | null
          city?: string
          country?: string
          country_code?: string | null
          created_at?: string
          description?: string | null
          image_url?: string | null
          is_wc26?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          opened_year?: number | null
          slug?: string
        }
        Relationships: []
      }
      standings: {
        Row: {
          drawn: number | null
          goal_diff: number | null
          goals_against: number | null
          goals_for: number | null
          group_letter: string
          id: number
          lost: number | null
          played: number | null
          points: number | null
          position: number | null
          qualification_status: string | null
          team_code: string
          tournament_year: number
          updated_at: string
          won: number | null
        }
        Insert: {
          drawn?: number | null
          goal_diff?: number | null
          goals_against?: number | null
          goals_for?: number | null
          group_letter: string
          id?: number
          lost?: number | null
          played?: number | null
          points?: number | null
          position?: number | null
          qualification_status?: string | null
          team_code: string
          tournament_year: number
          updated_at?: string
          won?: number | null
        }
        Update: {
          drawn?: number | null
          goal_diff?: number | null
          goals_against?: number | null
          goals_for?: number | null
          group_letter?: string
          id?: number
          lost?: number | null
          played?: number | null
          points?: number | null
          position?: number | null
          qualification_status?: string | null
          team_code?: string
          tournament_year?: number
          updated_at?: string
          won?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "standings_team_code_fkey"
            columns: ["team_code"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["code"]
          },
        ]
      }
      teams: {
        Row: {
          best_finish: string | null
          captain: string | null
          coach: string | null
          code: string
          confederation: string | null
          created_at: string
          fifa_ranking: number | null
          flag_emoji: string | null
          flag_url: string | null
          founded_year: number | null
          group_letter: string | null
          name: string
          nickname: string | null
          short_name: string | null
          wc_appearances: number | null
          wc_titles: number | null
        }
        Insert: {
          best_finish?: string | null
          captain?: string | null
          coach?: string | null
          code: string
          confederation?: string | null
          created_at?: string
          fifa_ranking?: number | null
          flag_emoji?: string | null
          flag_url?: string | null
          founded_year?: number | null
          group_letter?: string | null
          name: string
          nickname?: string | null
          short_name?: string | null
          wc_appearances?: number | null
          wc_titles?: number | null
        }
        Update: {
          best_finish?: string | null
          captain?: string | null
          coach?: string | null
          code?: string
          confederation?: string | null
          created_at?: string
          fifa_ranking?: number | null
          flag_emoji?: string | null
          flag_url?: string | null
          founded_year?: number | null
          group_letter?: string | null
          name?: string
          nickname?: string | null
          short_name?: string | null
          wc_appearances?: number | null
          wc_titles?: number | null
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          created_at: string
          final_score: string | null
          golden_ball: string | null
          golden_glove: string | null
          host_countries: string[]
          matches_played: number | null
          runner_up_code: string | null
          summary: string | null
          teams_count: number | null
          third_place_code: string | null
          top_scorer: string | null
          top_scorer_goals: number | null
          total_goals: number | null
          winner_code: string | null
          year: number
        }
        Insert: {
          created_at?: string
          final_score?: string | null
          golden_ball?: string | null
          golden_glove?: string | null
          host_countries: string[]
          matches_played?: number | null
          runner_up_code?: string | null
          summary?: string | null
          teams_count?: number | null
          third_place_code?: string | null
          top_scorer?: string | null
          top_scorer_goals?: number | null
          total_goals?: number | null
          winner_code?: string | null
          year: number
        }
        Update: {
          created_at?: string
          final_score?: string | null
          golden_ball?: string | null
          golden_glove?: string | null
          host_countries?: string[]
          matches_played?: number | null
          runner_up_code?: string | null
          summary?: string | null
          teams_count?: number | null
          third_place_code?: string | null
          top_scorer?: string | null
          top_scorer_goals?: number | null
          total_goals?: number | null
          winner_code?: string | null
          year?: number
        }
        Relationships: []
      }
      translations: {
        Row: {
          entity_key: string
          entity_type: string
          id: number
          locale: string
          value: string
        }
        Insert: {
          entity_key: string
          entity_type: string
          id?: number
          locale: string
          value: string
        }
        Update: {
          entity_key?: string
          entity_type?: string
          id?: number
          locale?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_page_visits: { Args: never; Returns: undefined }
      recompute_prediction_points: { Args: never; Returns: number }
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
