import { NextResponse } from 'next/server'
import { enhancedSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Enhanced test: Testing database connection...')
    
    // Use the enhanced client for testing
    const result = await enhancedSupabase.testConnection()

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        details: 'Enhanced client connection failed'
      }, { status: 500 })
    }

    // Also test a simple count query
    const { data, error } = await enhancedSupabase.getClient()
      .from('events')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ 
      success: true, 
      message: 'Enhanced client connection successful',
      eventCount: result.count || 0,
      totalCount: data?.length || 0,
      sampleEvents: data?.slice(0, 3) || [],
      hasData: (result.count || 0) > 0,
      error: error?.message || null,
      rlsStatus: 'Enhanced client used for testing'
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 