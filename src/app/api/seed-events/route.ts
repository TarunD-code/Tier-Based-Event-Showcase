import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use the anon key but with a different approach
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://azvysnblmxoiylnnalgn.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dnlzbmJsbXhvaXlsbm5hbGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDQxNDYsImV4cCI6MjA2OTQ4MDE0Nn0.5aYr1WyrT9FL5d6pHhKg6-E1IRSUfcw1ARSQW5AsCtE'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const sampleEvents = [
  // Free Events
  {
    title: "Community Meetup",
    description: "Join us for a casual community meetup where you can network with fellow enthusiasts and share your experiences.",
    event_date: "2025-01-15T18:00:00Z",
    image_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=225&fit=crop",
    tier: "free"
  },
  {
    title: "Introduction to Web Development",
    description: "Learn the basics of HTML, CSS, and JavaScript in this beginner-friendly workshop.",
    event_date: "2025-01-20T14:00:00Z",
    image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop",
    tier: "free"
  },
  
  // Silver Events
  {
    title: "Advanced JavaScript Workshop",
    description: "Deep dive into modern JavaScript features including ES6+, async/await, and functional programming concepts.",
    event_date: "2025-01-25T10:00:00Z",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop",
    tier: "silver"
  },
  {
    title: "React Fundamentals",
    description: "Master React basics including components, props, state, and hooks with hands-on exercises.",
    event_date: "2025-02-01T15:00:00Z",
    image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
    tier: "silver"
  },
  
  // Gold Events
  {
    title: "Full-Stack Development Bootcamp",
    description: "Comprehensive 3-day bootcamp covering frontend, backend, and database development with real-world projects.",
    event_date: "2025-02-10T09:00:00Z",
    image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
    tier: "gold"
  },
  {
    title: "System Design Masterclass",
    description: "Learn to design scalable systems with expert guidance on architecture patterns and best practices.",
    event_date: "2025-02-15T13:00:00Z",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    tier: "gold"
  },
  
  // Platinum Events
  {
    title: "AI/ML Innovation Summit",
    description: "Exclusive summit featuring industry leaders discussing the future of AI and machine learning technologies.",
    event_date: "2025-02-20T08:00:00Z",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop",
    tier: "platinum"
  },
  {
    title: "Tech Leadership Retreat",
    description: "Intimate 2-day retreat for tech leaders to discuss strategy, innovation, and industry trends.",
    event_date: "2025-02-25T10:00:00Z",
    image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop",
    tier: "platinum"
  }
]

export async function POST() {
  try {
    console.log('Starting database seeding...')
    
    // First, check if table exists by trying to select from it
    const { error: checkError } = await supabase
      .from('events')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('Error checking table:', checkError)
      
      // If it's an RLS error, we'll try to insert anyway
      if (checkError.message.includes('row-level security') || checkError.message.includes('Invalid API key')) {
        console.log('RLS error detected, attempting to insert with anon key...')
      } else {
        return NextResponse.json({ 
          error: 'Database table not found or inaccessible',
          details: checkError.message 
        }, { status: 500 })
      }
    }

    console.log('Table exists, proceeding with seeding...')

    // Try to clear existing events (if any)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (deleteError) {
      console.log('Could not clear existing events (RLS restriction), continuing...')
    }

    console.log('Attempting to insert new events...')

    // Insert new events one by one to handle potential RLS issues
    const insertedEvents = []
    let successCount = 0
    let errorCount = 0

    for (const event of sampleEvents) {
      try {
        const { data, error } = await supabase
          .from('events')
          .insert(event)
          .select()

        if (error) {
          console.error(`Error inserting event "${event.title}":`, error)
          errorCount++
        } else {
          console.log(`Successfully inserted event "${event.title}"`)
          insertedEvents.push(data[0])
          successCount++
        }
      } catch (err) {
        console.error(`Exception inserting event "${event.title}":`, err)
        errorCount++
      }
    }

    console.log(`Seeding completed: ${successCount} successful, ${errorCount} failed`)

    if (successCount === 0) {
      return NextResponse.json({ 
        error: 'Failed to insert any events',
        details: 'All insertions failed due to RLS policies or API key issues',
        successCount,
        errorCount
      }, { status: 500 })
    }

    // Get final count
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ 
      success: true,
      message: `Database seeded successfully with ${successCount} events`, 
      eventsCount: successCount,
      totalCount: count || 0,
      errorCount,
      events: insertedEvents 
    })
  } catch (error) {
    console.error('Unexpected error during seeding:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 