import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// For development, provide fallback values
const fallbackUrl = 'https://azvysnblmxoiylnnalgn.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dnlzbmJsbXhvaXlsbm5hbGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDQxNDYsImV4cCI6MjA2OTQ4MDE0Nn0.5aYr1WyrT9FL5d6pHhKg6-E1IRSUfcw1ARSQW5AsCtE'

const finalUrl = supabaseUrl || fallbackUrl
const finalKey = supabaseAnonKey || fallbackKey

export const supabase = createClient(finalUrl, finalKey)

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