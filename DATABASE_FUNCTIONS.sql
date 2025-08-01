-- Database Functions for Enhanced RLS Setup
-- These functions support the tier-based access control

-- Function to set user tier for RLS policies
CREATE OR REPLACE FUNCTION set_user_tier(user_tier text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Set the user tier in the session
    PERFORM set_config('app.user_tier', user_tier, false);
    
    -- Log the tier setting for debugging
    RAISE NOTICE 'User tier set to: %', user_tier;
END;
$$;

-- Function to temporarily disable RLS for seeding
CREATE OR REPLACE FUNCTION disable_rls_temporarily()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Temporarily disable RLS on events table
    ALTER TABLE events DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS temporarily disabled for seeding';
END;
$$;

-- Function to re-enable RLS after seeding
CREATE OR REPLACE FUNCTION enable_rls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Re-enable RLS on events table
    ALTER TABLE events ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS re-enabled after seeding';
END;
$$;

-- Function to get events for a specific tier (for testing)
CREATE OR REPLACE FUNCTION get_events_for_tier(user_tier text)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    event_date timestamptz,
    image_url text,
    tier tier_type,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Set the user tier
    PERFORM set_config('app.user_tier', user_tier, false);
    
    -- Return events based on RLS policies
    RETURN QUERY
    SELECT e.id, e.title, e.description, e.event_date, e.image_url, e.tier, e.created_at
    FROM events e;
END;
$$;

-- Function to test RLS policies
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE (
    tier text,
    event_count bigint,
    sample_events text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Test each tier
    RETURN QUERY
    SELECT 
        'free'::text as tier,
        COUNT(*) as event_count,
        STRING_AGG(title, ', ') as sample_events
    FROM get_events_for_tier('free')
    
    UNION ALL
    
    SELECT 
        'silver'::text as tier,
        COUNT(*) as event_count,
        STRING_AGG(title, ', ') as sample_events
    FROM get_events_for_tier('silver')
    
    UNION ALL
    
    SELECT 
        'gold'::text as tier,
        COUNT(*) as event_count,
        STRING_AGG(title, ', ') as sample_events
    FROM get_events_for_tier('gold')
    
    UNION ALL
    
    SELECT 
        'platinum'::text as tier,
        COUNT(*) as event_count,
        STRING_AGG(title, ', ') as sample_events
    FROM get_events_for_tier('platinum');
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION set_user_tier(text) TO anon;
GRANT EXECUTE ON FUNCTION disable_rls_temporarily() TO anon;
GRANT EXECUTE ON FUNCTION enable_rls() TO anon;
GRANT EXECUTE ON FUNCTION get_events_for_tier(text) TO anon;
GRANT EXECUTE ON FUNCTION test_rls_policies() TO anon;

-- Test the functions (optional)
-- SELECT test_rls_policies(); 