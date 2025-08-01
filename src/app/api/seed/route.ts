import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    // First, clear existing events
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (deleteError) {
      console.error('Error clearing events:', deleteError)
      return NextResponse.json({ error: 'Failed to clear existing events' }, { status: 500 })
    }

    // Insert new events
    const { data, error } = await supabase
      .from('events')
      .insert(sampleEvents)
      .select()

    if (error) {
      console.error('Error seeding events:', error)
      return NextResponse.json({ error: 'Failed to seed events' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully', 
      events: data 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 