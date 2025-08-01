# 🚀 Deployment Guide

This guide will help you deploy the Tier-Based Event Showcase to production.

## 📋 Prerequisites

1. **GitHub Account**: For version control
2. **Vercel Account**: For hosting (recommended)
3. **Supabase Account**: For database
4. **Clerk Account**: For authentication

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `tier-based-event-showcase`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"

### 2. Get Database Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon public key**
   - **Service role key** (keep this secret!)

### 3. Set Up Database Schema

1. Go to **SQL Editor**
2. Run the SQL from `database-setup.sql`:

```sql
-- Create enum for tier types
CREATE TYPE tier_type AS ENUM ('free', 'silver', 'gold', 'platinum');

-- Create events table
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT,
    tier tier_type NOT NULL DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy for tier-based access
CREATE POLICY "Users can view events based on their tier" ON events
    FOR SELECT USING (
        tier = 'free' OR
        (tier = 'silver' AND current_setting('app.user_tier', true) IN ('silver', 'gold', 'platinum')) OR
        (tier = 'gold' AND current_setting('app.user_tier', true) IN ('gold', 'platinum')) OR
        (tier = 'platinum' AND current_setting('app.user_tier', true) = 'platinum')
    );

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
('Tech Leadership Retreat', 'Intimate 2-day retreat for tech leaders to discuss strategy, innovation, and industry trends.', '2025-02-25T10:00:00Z', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop', 'platinum');

-- Create indexes for better performance
CREATE INDEX idx_events_tier ON events(tier);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_created_at ON events(created_at);
```

## 🔐 Authentication Setup (Clerk)

### 1. Create Clerk Application

1. Go to [Clerk](https://clerk.dev) and sign up/login
2. Click "Add Application"
3. Choose "Next.js" as your framework
4. Enter application details:
   - **Name**: `Tier-Based Event Showcase`
   - **URL**: Your production URL (e.g., `https://your-app.vercel.app`)

### 2. Configure Authentication

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable the authentication methods you want
3. Go to **Paths** and configure:
   - **Sign-in URL**: `/sign-in`
   - **Sign-up URL**: `/sign-up`
   - **After sign-in URL**: `/events`
   - **After sign-up URL**: `/events`

### 3. Get API Keys

1. Go to **API Keys**
2. Copy the following:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

## 🌐 Deployment (Vercel)

### 1. Prepare Your Code

1. Push your code to GitHub:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 3. Set Environment Variables

In your Vercel project settings, add these environment variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
CLERK_SECRET_KEY=sk_live_your_secret_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Production
NEXT_PUBLIC_DEBUG=false
```

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://your-app.vercel.app`

## 🧪 Post-Deployment Testing

### 1. Test Database Connection

Visit: `https://your-app.vercel.app/test-db`

Should show: ✅ Connected! Found 8 events

### 2. Test Authentication

1. Visit your app homepage
2. Try signing up with a new account
3. Verify you can sign in/out

### 3. Test Tier System

1. Sign in to your app
2. Go to `/events`
3. Test tier upgrades (demo mode)
4. Verify events are filtered correctly

### 4. Test API Endpoints

```bash
# Test database connection
curl https://your-app.vercel.app/api/test-connection

# Seed database (if needed)
curl -X POST https://your-app.vercel.app/api/seed-events
```

## 🔧 Custom Domain (Optional)

### 1. Add Custom Domain in Vercel

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### 2. Update Clerk Settings

1. Go to your Clerk application settings
2. Update the production URL to your custom domain
3. Update the allowed origins

## 📊 Monitoring & Analytics

### 1. Vercel Analytics

1. Enable Vercel Analytics in your project settings
2. Monitor performance and user behavior

### 2. Supabase Monitoring

1. Go to your Supabase dashboard
2. Check the "Logs" section for any errors
3. Monitor database performance

### 3. Clerk Analytics

1. Go to your Clerk dashboard
2. Check user sign-ups and authentication metrics

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Double-check all environment variables in Vercel
   - Ensure no typos in keys

2. **Database Connection Failed**
   - Verify Supabase URL and keys
   - Check if database schema is set up correctly

3. **Authentication Not Working**
   - Verify Clerk publishable and secret keys
   - Check Clerk application settings
   - Ensure production URL is configured correctly

4. **Build Failures**
   - Check Vercel build logs
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

### Debug Mode

Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

## 🔄 Continuous Deployment

Your app will automatically redeploy when you push to the `main` branch.

### Deployment Workflow

1. Make changes to your code
2. Test locally: `npm run dev`
3. Commit and push: `git push origin main`
4. Vercel automatically builds and deploys
5. Test the live deployment

## 📈 Performance Optimization

### 1. Image Optimization

- Use Next.js Image component for automatic optimization
- Consider using a CDN for static assets

### 2. Database Optimization

- Add appropriate indexes for frequently queried columns
- Use connection pooling for better performance

### 3. Caching

- Implement Redis for session storage (if needed)
- Use Vercel's edge caching

## 🎉 Congratulations!

Your Tier-Based Event Showcase is now live! 

**Next Steps:**
1. Share your app with users
2. Monitor performance and user feedback
3. Add more features as needed
4. Consider adding analytics and monitoring tools

---

**Need Help?**
- Check the [Vercel Documentation](https://vercel.com/docs)
- Review [Supabase Documentation](https://supabase.com/docs)
- Consult [Clerk Documentation](https://clerk.com/docs) 