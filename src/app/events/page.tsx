'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { supabase, Event, UserTier } from '@/lib/supabase'
import Link from 'next/link'

const tierOrder: UserTier[] = ['free', 'silver', 'gold', 'platinum']

const getTierColor = (tier: UserTier) => {
  switch (tier) {
    case 'free':
      return 'bg-gray-100 text-gray-800'
    case 'silver':
      return 'bg-gray-200 text-gray-800'
    case 'gold':
      return 'bg-yellow-100 text-yellow-800'
    case 'platinum':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTierDisplayName = (tier: UserTier) => {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

export default function EventsPage() {
  const { isSignedIn, user } = useUser()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<UserTier>('free')

  useEffect(() => {
    if (isSignedIn && user) {
      // Get user tier from Clerk metadata
      const tier = user.publicMetadata.tier as UserTier || 'free'
      setUserTier(tier)
      fetchEvents(tier)
    } else {
      // For demo purposes, show free events
      fetchEvents('free')
    }
  }, [isSignedIn, user])

  const fetchEvents = async (tier: UserTier) => {
    try {
      setLoading(true)
      
      // Get the index of the user's tier
      const userTierIndex = tierOrder.indexOf(tier)
      
      // Get all tiers up to and including the user's tier
      const allowedTiers = tierOrder.slice(0, userTierIndex + 1)
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .in('tier', allowedTiers)
        .order('event_date', { ascending: true })

      if (error) {
        throw error
      }

      setEvents(data || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleTierUpgrade = async (newTier: UserTier) => {
    if (!isSignedIn) return
    
    try {
      // In a real app, this would update Clerk metadata
      // For demo purposes, we'll just update local state
      setUserTier(newTier)
      fetchEvents(newTier)
    } catch (err) {
      console.error('Error upgrading tier:', err)
    }
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Please Sign In
          </h1>
          <p className="text-gray-300 mb-6 text-lg">
            You need to be signed in to view events.
          </p>
          <Link 
            href="/"
            className="text-blue-400 hover:text-blue-300 font-medium text-lg"
          >
            Go back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                ← Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-white">
                Events
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Current Tier: <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(userTier)}`}>
                  {getTierDisplayName(userTier)}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tier Upgrade Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            Upgrade Your Tier (Demo)
          </h2>
          <div className="flex flex-wrap gap-2">
            {tierOrder.map((tier) => (
              <button
                key={tier}
                onClick={() => handleTierUpgrade(tier)}
                disabled={tier === userTier}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  tier === userTier
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : `${getTierColor(tier)} hover:opacity-80 cursor-pointer`
                }`}
              >
                {getTierDisplayName(tier)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-300 text-lg">Loading events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg">No events available for your tier.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                <div className="aspect-w-16 aspect-h-9 bg-gray-700">
                  <img
                    src={event.image_url || 'https://via.placeholder.com/400x225?text=Event+Image'}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(event.tier)}`}>
                      {getTierDisplayName(event.tier)}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(event.event_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {event.description}
                  </p>
                  {tierOrder.indexOf(event.tier) > tierOrder.indexOf(userTier) && (
                    <div className="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded">
                      <p className="text-sm text-yellow-200">
                        💎 Upgrade to {getTierDisplayName(event.tier)} to access this event
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 