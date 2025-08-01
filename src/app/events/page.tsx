'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { enhancedSupabase, Event, UserTier } from '@/lib/supabase'
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
  const [rlsStatus, setRlsStatus] = useState<string>('checking')

  useEffect(() => {
    if (isSignedIn && user) {
      // Get user tier from Clerk metadata
      const tier = user.publicMetadata.tier as UserTier || 'free'
      console.log('User metadata:', user.publicMetadata)
      console.log('Detected tier:', tier)
      setUserTier(tier)
      
      // Set the tier in the enhanced client
      enhancedSupabase.setUserTier(tier)
      
      fetchEvents(tier)
    } else {
      // For demo purposes, show free events
      console.log('User not signed in, defaulting to free tier')
      setUserTier('free')
      enhancedSupabase.setUserTier('free')
      fetchEvents('free')
    }
  }, [isSignedIn, user])

  const fetchEvents = async (tier: UserTier) => {
    try {
      setLoading(true)
      setRlsStatus('fetching')
      
      console.log(`Enhanced client: Fetching events for tier ${tier}`)
      
      // Use the enhanced client for better RLS integration
      const { data, error } = await enhancedSupabase.getEvents(tier)

      if (error) {
        console.error('Enhanced client error:', error)
        setError('Failed to load events')
        setRlsStatus('error')
      } else {
        console.log(`Enhanced client: Retrieved ${data?.length || 0} events for tier ${tier}`)
        setEvents(data || [])
        setRlsStatus('success')
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events')
      setRlsStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const getRlsStatusColor = () => {
    switch (rlsStatus) {
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'fetching':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getRlsStatusText = () => {
    switch (rlsStatus) {
      case 'success':
        return '✅ RLS Working'
      case 'error':
        return '⚠️ RLS Error (using fallback)'
      case 'fetching':
        return '🔄 Fetching...'
      default:
        return '⏳ Checking...'
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
                <span className="text-xs text-gray-400 ml-2">
                  (Access: {tierOrder.slice(0, tierOrder.indexOf(userTier) + 1).map(t => getTierDisplayName(t)).join(' + ')})
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* RLS Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${getRlsStatusColor()}`}>
              {getRlsStatusText()}
            </span>
            <span className="text-xs text-gray-400">
              Enhanced RLS Client v2.0
            </span>
          </div>
        </div>
      </div>

      {/* Access Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-200 mb-2">
            Your Access Level
          </h3>
          <p className="text-blue-100 text-sm">
            As a <span className="font-medium">{getTierDisplayName(userTier)}</span> user, you can access: 
            <span className="font-medium text-blue-200">
              {' '}{tierOrder.slice(0, tierOrder.indexOf(userTier) + 1).map(t => getTierDisplayName(t)).join(' + ')}
            </span> events
          </p>
          <div className="mt-3 pt-3 border-t border-blue-700">
            <p className="text-blue-200 text-xs">
              <strong>Debug Info:</strong> User tier: {userTier}, Allowed tiers: {tierOrder.slice(0, tierOrder.indexOf(userTier) + 1).join(', ')}
            </p>
            <p className="text-blue-200 text-xs mt-1">
              <strong>RLS Status:</strong> {rlsStatus === 'success' ? 'Server-side filtering active' : 'Client-side fallback active'}
            </p>
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
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x225?text=Event+Image';
                    }}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 