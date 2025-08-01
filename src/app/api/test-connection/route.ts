import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test the connection by fetching all events
    const { data, error } = await supabase
      .from('events')
      .select('*')

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: 'Database connection failed'
      }, { status: 500 })
    }

    // Also test a simple count query
    const { count, error: countError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      eventCount: data?.length || 0,
      totalCount: count || 0,
      sampleEvents: data?.slice(0, 3) || [],
      hasData: (data?.length || 0) > 0,
      error: countError?.message || null
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 