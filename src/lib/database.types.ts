export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          profile_picture_url: string | null;
          subscription_tier_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          profile_picture_url?: string | null;
          subscription_tier_id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          profile_picture_url?: string | null;
          subscription_tier_id?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          date_start: string;
          date_end: string | null;
          location: string;
          description: string | null;
          cover_image_url: string | null;
          privacy_setting: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          date_start: string;
          date_end?: string | null;
          location: string;
          description?: string | null;
          cover_image_url?: string | null;
          privacy_setting?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          date_start?: string;
          date_end?: string | null;
          location?: string;
          description?: string | null;
          cover_image_url?: string | null;
          privacy_setting?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      guests: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          email: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          email: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          event_id: string;
          guest_id: string;
          status: string;
          invitation_link: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          guest_id: string;
          status?: string;
          invitation_link: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          guest_id?: string;
          status?: string;
          invitation_link?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      rsvps: {
        Row: {
          id: string;
          invitation_id: string;
          status: string;
          guest_count: number;
          dietary_restrictions: string | null;
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          status: string;
          guest_count?: number;
          dietary_restrictions?: string | null;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          status?: string;
          guest_count?: number;
          dietary_restrictions?: string | null;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      gift_items: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          description: string | null;
          desired_price: number;
          quantity: number;
          purchased_quantity: number;
          external_link: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          description?: string | null;
          desired_price: number;
          quantity?: number;
          purchased_quantity?: number;
          external_link?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          description?: string | null;
          desired_price?: number;
          quantity?: number;
          purchased_quantity?: number;
          external_link?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          gift_item_id: string;
          user_id: string | null;
          amount: number;
          paystack_reference: string;
          status: string;
          fee_amount: number;
          payout_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gift_item_id: string;
          user_id?: string | null;
          amount: number;
          paystack_reference: string;
          status?: string;
          fee_amount?: number;
          payout_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gift_item_id?: string;
          user_id?: string | null;
          amount?: number;
          paystack_reference?: string;
          status?: string;
          fee_amount?: number;
          payout_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          event_id: string;
          user_id_uploader: string;
          image_url: string;
          caption: string | null;
          privacy_setting: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id_uploader: string;
          image_url: string;
          caption?: string | null;
          privacy_setting?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id_uploader?: string;
          image_url?: string;
          caption?: string | null;
          privacy_setting?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_tiers: {
        Row: {
          id: number;
          name: string;
          monthly_price: number;
          annual_price: number;
          max_events: number;
          max_guests: number;
          transaction_fee_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          monthly_price: number;
          annual_price: number;
          max_events: number;
          max_guests: number;
          transaction_fee_percentage: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          monthly_price?: number;
          annual_price?: number;
          max_events?: number;
          max_guests?: number;
          transaction_fee_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier_id: number;
          start_date: string;
          end_date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier_id: number;
          start_date: string;
          end_date: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier_id?: number;
          start_date?: string;
          end_date?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}