-- Tier-Based Event Showcase Database Setup
-- Run this SQL in your Supabase SQL editor

-- Create enum for tier types
CREATE TYPE IF NOT EXISTS tier_type AS ENUM ('free', 'silver', 'gold', 'platinum');

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT,
    tier tier_type NOT NULL DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Temporarily disable RLS for seeding
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Insert sample events
INSERT INTO events (title, description, event_date, image_url, tier) VALUES
-- Free Events
('Community Meetup', 'Join us for a casual community meetup where you can network with fellow enthusiasts and share your experiences.', '2025-01-15T18:00:00Z', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=225&fit=crop', 'free'),
('Introduction to Web Development', 'Learn the basics of HTML, CSS, and JavaScript in this beginner-friendly workshop.', '2025-01-20T14:00:00Z', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop', 'free'),

-- Silver Events
('Advanced JavaScript Workshop', 'Deep dive into modern JavaScript features including ES6+, async/await, and functional programming concepts.', '2025-01-25T10:00:00Z', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop', 'silver'),
('React Fundamentals', 'Master React basics including components, props, state, and hooks with hands-on exercises.', '2025-02-01T15:00:00Z', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop', 'silver'),

-- Gold Events
('Full-Stack Development Bootcamp', 'Comprehensive 3-day bootcamp covering frontend, backend, and database development with real-world projects.', '2025-02-10T09:00:00Z', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop', 'gold'),
('System Design Masterclass', 'Learn to design scalable systems with expert guidance on architecture patterns and best practices.', '2025-02-15T13:00:00Z', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop', 'gold'),

-- Platinum Events
('AI/ML Innovation Summit', 'Exclusive summit featuring industry leaders discussing the future of AI and machine learning technologies.', '2025-02-20T08:00:00Z', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop', 'platinum'),
('Tech Leadership Retreat', 'Intimate 2-day retreat for tech leaders to discuss strategy, innovation, and industry trends.', '2025-02-25T10:00:00Z', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop', 'platinum')
ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy for tier-based access (simplified for demo)
CREATE POLICY IF NOT EXISTS "Users can view events based on their tier" ON events
    FOR SELECT USING (true); -- Allow all users to view all events for demo

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_tier ON events(tier);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Verify the data
SELECT tier, COUNT(*) as event_count FROM events GROUP BY tier ORDER BY tier; 