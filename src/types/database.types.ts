export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'member';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      campaigns: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          status: 'draft' | 'active' | 'paused' | 'completed';
          subject_lines: string[];
          body_templates: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          status?: 'draft' | 'active' | 'paused' | 'completed';
          subject_lines?: string[];
          body_templates?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          status?: 'draft' | 'active' | 'paused' | 'completed';
          subject_lines?: string[];
          body_templates?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      leads: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          company_name: string | null;
          website: string | null;
          status: 'lead' | 'contacted' | 'replied' | 'meeting_scheduled' | 'unsubscribed';
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          website?: string | null;
          status?: 'lead' | 'contacted' | 'replied' | 'meeting_scheduled' | 'unsubscribed';
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          website?: string | null;
          status?: 'lead' | 'contacted' | 'replied' | 'meeting_scheduled' | 'unsubscribed';
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      emails: {
        Row: {
          id: string;
          organization_id: string;
          campaign_id: string | null;
          lead_id: string;
          subject: string;
          body: string;
          status: 'sent' | 'opened' | 'clicked' | 'bounced';
          direction: 'outbound' | 'inbound';
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          campaign_id?: string | null;
          lead_id: string;
          subject: string;
          body: string;
          status?: 'sent' | 'opened' | 'clicked' | 'bounced';
          direction?: 'outbound' | 'inbound';
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          campaign_id?: string | null;
          lead_id?: string;
          subject?: string;
          body?: string;
          status?: 'sent' | 'opened' | 'clicked' | 'bounced';
          direction?: 'outbound' | 'inbound';
          sent_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "emails_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "emails_campaign_id_fkey";
            columns: ["campaign_id"];
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "emails_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          }
        ];
      };
      replies: {
        Row: {
          id: string;
          organization_id: string;
          email_id: string;
          body: string;
          sentiment: string | null;
          detected_intent: string | null;
          received_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email_id: string;
          body: string;
          sentiment?: string | null;
          detected_intent?: string | null;
          received_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          email_id?: string;
          body?: string;
          sentiment?: string | null;
          detected_intent?: string | null;
          received_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "replies_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "replies_email_id_fkey";
            columns: ["email_id"];
            referencedRelation: "emails";
            referencedColumns: ["id"];
          }
        ];
      };
      meetings: {
        Row: {
          id: string;
          organization_id: string;
          lead_id: string;
          scheduled_at: string;
          status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          lead_id: string;
          scheduled_at: string;
          status?: 'scheduled' | 'completed' | 'canceled' | 'no_show';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          lead_id?: string;
          scheduled_at?: string;
          status?: 'scheduled' | 'completed' | 'canceled' | 'no_show';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meetings_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meetings_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_org_member: {
        Args: {
          org_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      member_role: 'owner' | 'admin' | 'member';
      campaign_status: 'draft' | 'active' | 'paused' | 'completed';
      lead_status: 'lead' | 'contacted' | 'replied' | 'meeting_scheduled' | 'unsubscribed';
      email_status: 'sent' | 'opened' | 'clicked' | 'bounced';
      email_direction: 'outbound' | 'inbound';
      meeting_status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
    };
  };
}
