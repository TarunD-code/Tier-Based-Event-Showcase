import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// For development, provide fallback values
const fallbackUrl = 'https://azvysnblmxoiylnnalgn.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dnlzbmJsbXhvaXlsbm5hbGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDQxNDYsImV4cCI6MjA2OTQ4MDE0Nn0.5aYr1WyrT9FL5d6pHhKg6-E1IRSUfcw1ARSQW5AsCtE'

const finalUrl = supabaseUrl || fallbackUrl
const finalKey = supabaseAnonKey || fallbackKey

export const supabase = createClient(finalUrl, finalKey)

// Enhanced Supabase client with RLS support
export class EnhancedSupabaseClient {
  private client = supabase
  private userTier: UserTier = 'free'

  constructor() {
    this.client = supabase
  }

  // Set user tier for RLS policies
  setUserTier(tier: UserTier) {
    this.userTier = tier
    console.log(`Enhanced client: User tier set to ${tier}`)
  }

  // Get events with proper tier filtering
  async getEvents(userTier: UserTier = this.userTier) {
    try {
      // Set the user tier in the session for RLS policies
      await this.client.rpc('set_user_tier', { user_tier: userTier })
      
      const { data, error } = await this.client
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      if (error) {
        console.error('Enhanced client error:', error)
        // Fallback to client-side filtering
        return this.getEventsWithClientSideFiltering(userTier)
      }

      console.log(`Enhanced client: Retrieved ${data?.length || 0} events for tier ${userTier}`)
      return { data, error: null }
    } catch (err) {
      console.error('Enhanced client exception:', err)
      return this.getEventsWithClientSideFiltering(userTier)
    }
  }

  // Fallback method with client-side filtering
  private async getEventsWithClientSideFiltering(userTier: UserTier) {
    try {
      const { data, error } = await this.client
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      if (error) {
        throw error
      }

      // Client-side tier filtering
      const tierOrder: UserTier[] = ['free', 'silver', 'gold', 'platinum']
      const userTierIndex = tierOrder.indexOf(userTier)
      const allowedTiers = tierOrder.slice(0, userTierIndex + 1)
      
      const filteredEvents = data?.filter(event => allowedTiers.includes(event.tier)) || []
      
      console.log(`Enhanced client fallback: Filtered ${data?.length || 0} total events to ${filteredEvents.length} for tier ${userTier}`)
      
      return { data: filteredEvents, error: null }
    } catch (err) {
      console.error('Enhanced client fallback error:', err)
      return { data: null, error: err }
    }
  }

  // Test database connection
  async testConnection() {
    try {
      const { data, error } = await this.client
        .from('events')
        .select('*', { count: 'exact', head: true })

      return {
        success: !error,
        error: error?.message || null,
        count: data?.length || 0
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        count: 0
      }
    }
  }

  // Seed events (admin function)
  async seedEvents(events: Event[]) {
    try {
      // Temporarily disable RLS for seeding
      await this.client.rpc('disable_rls_temporarily')
      
      const { data, error } = await this.client
        .from('events')
        .insert(events)
        .select()

      // Re-enable RLS
      await this.client.rpc('enable_rls')

      return { data, error }
    } catch (err) {
      console.error('Seeding error:', err)
      return { data: null, error: err }
    }
  }
}

// Database types
export interface Event {
  id: string
  title: string
  description: string
  event_date: string
  image_url: string
  tier: 'free' | 'silver' | 'gold' | 'platinum'
  created_at?: string
}

export type UserTier = 'free' | 'silver' | 'gold' | 'platinum'

// Create enhanced client instance
export const enhancedSupabase = new EnhancedSupabaseClient() 