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
      avaliacoes_enviadas: {
        Row: {
          data: string
          enviado_em: string | null
          id: number
          id_grupo: string
        }
        Insert: {
          data: string
          enviado_em?: string | null
          id?: number
          id_grupo: string
        }
        Update: {
          data?: string
          enviado_em?: string | null
          id?: number
          id_grupo?: string
        }
        Relationships: []
      }
      chamados_whatsapp: {
        Row: {
          atendente: string
          chave_unica: string
          created_at: string
          data: string
          grupo: string
          id: number
          id_grupo: string | null
          telefone: string
        }
        Insert: {
          atendente: string
          chave_unica: string
          created_at?: string
          data: string
          grupo: string
          id?: number
          id_grupo?: string | null
          telefone: string
        }
        Update: {
          atendente?: string
          chave_unica?: string
          created_at?: string
          data?: string
          grupo?: string
          id?: number
          id_grupo?: string | null
          telefone?: string
        }
        Relationships: []
      }
      clientes_devel: {
        Row: {
          criado_em: string | null
          devel_card_id: string | null
          id: string
          link: string
          nome: string
          tipo: string
        }
        Insert: {
          criado_em?: string | null
          devel_card_id?: string | null
          id?: string
          link: string
          nome: string
          tipo: string
        }
        Update: {
          criado_em?: string | null
          devel_card_id?: string | null
          id?: string
          link?: string
          nome?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_devel_devel_card_id_fkey"
            columns: ["devel_card_id"]
            isOneToOne: false
            referencedRelation: "devel_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      devel_tickets: {
        Row: {
          criado_em: string | null
          data: string | null
          descricao: string | null
          id: string
          link_do_card: string
          nome_do_grupo: string | null
          quantidade: number | null
          responsavel: string | null
          status: string | null
        }
        Insert: {
          criado_em?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          link_do_card: string
          nome_do_grupo?: string | null
          quantidade?: number | null
          responsavel?: string | null
          status?: string | null
        }
        Update: {
          criado_em?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          link_do_card?: string
          nome_do_grupo?: string | null
          quantidade?: number | null
          responsavel?: string | null
          status?: string | null
        }
        Relationships: []
      }
      formulario_suporte: {
        Row: {
          created_at: string
          email: string | null
          empresa: string | null
          id: number
          name: string | null
          nota: number | null
          notes: string | null
          phone: number | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          empresa?: string | null
          id?: number
          name?: string | null
          nota?: number | null
          notes?: string | null
          phone?: number | null
        }
        Update: {
          created_at?: string
          email?: string | null
          empresa?: string | null
          id?: number
          name?: string | null
          nota?: number | null
          notes?: string | null
          phone?: number | null
        }
        Relationships: []
      }
      satisfacao: {
        Row: {
          avaliacao: string | null
          created_at: string
          grupo: string | null
          id: number
          nota_convertida: number | null
          participantPhone: string | null
          usuario: string | null
        }
        Insert: {
          avaliacao?: string | null
          created_at?: string
          grupo?: string | null
          id?: number
          nota_convertida?: number | null
          participantPhone?: string | null
          usuario?: string | null
        }
        Update: {
          avaliacao?: string | null
          created_at?: string
          grupo?: string | null
          id?: number
          nota_convertida?: number | null
          participantPhone?: string | null
          usuario?: string | null
        }
        Relationships: []
      }
      shortcuts: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          title: string
          url: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          title: string
          url: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          title?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suporte_cards: {
        Row: {
          created_at: string | null
          data: string | null
          id: number
          link_do_card_ct: string | null
          link_do_card_devel: string | null
          nome_do_grupo: string | null
          owner_id: string | null
          responsavel: string | null
          resumo: string | null
          retorno: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          id?: number
          link_do_card_ct?: string | null
          link_do_card_devel?: string | null
          nome_do_grupo?: string | null
          owner_id?: string | null
          responsavel?: string | null
          resumo?: string | null
          retorno?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string | null
          id?: number
          link_do_card_ct?: string | null
          link_do_card_devel?: string | null
          nome_do_grupo?: string | null
          owner_id?: string | null
          responsavel?: string | null
          resumo?: string | null
          retorno?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      relatorio_interacoes_diario: {
        Row: {
          atendente: string | null
          data: string | null
          grupo: string | null
          telefone: string | null
          total_interacoes: number | null
        }
        Relationships: []
      }
      relatorio_interacoes_diario_atendimento: {
        Row: {
          atendente: string | null
          data: string | null
          telefone: string | null
          total_atendimentos: number | null
          total_ponderado: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
