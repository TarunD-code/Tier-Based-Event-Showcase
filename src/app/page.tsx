'use client'

import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  const { isSignedIn, user } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                🎭 Tier-Based Event Showcase
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-300">
                    Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                  </span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <SignInButton mode="modal">
                    <button className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            Discover Amazing Events
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Access exclusive events based on your membership tier. From free events to platinum exclusives, 
            there&apos;s something for everyone.
          </p>
          
          {isSignedIn ? (
            <div className="mt-8">
              <Link 
                href="/events"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-lg"
              >
                View Events
              </Link>
            </div>
          ) : (
            <div className="mt-8">
              <p className="text-sm text-gray-400 mb-4">
                Sign in to access your personalized event feed
              </p>
              <SignUpButton mode="modal">
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-lg">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>

        {/* Tier Information */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Membership Tiers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Free', color: 'bg-gray-700', textColor: 'text-white' },
              { name: 'Silver', color: 'bg-gray-600', textColor: 'text-white' },
              { name: 'Gold', color: 'bg-yellow-600', textColor: 'text-white' },
              { name: 'Platinum', color: 'bg-purple-600', textColor: 'text-white' },
            ].map((tier) => (
              <div key={tier.name} className={`${tier.color} rounded-lg p-6 text-center border border-gray-600 shadow-lg`}>
                <h4 className={`text-lg font-semibold ${tier.textColor}`}>
                  {tier.name}
                </h4>
                <p className="text-sm text-gray-300 mt-2">
                  Access to {tier.name.toLowerCase()} events and below
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Development Tools */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Development Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              href="/test-db"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 text-center transition-colors border border-gray-600 shadow-lg"
            >
              <h4 className="text-lg font-semibold text-green-400">
                🗄️ Test Database
              </h4>
              <p className="text-sm text-gray-300 mt-2">
                Check database connection and view current data
              </p>
            </Link>
            <Link 
              href="/seed-db"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 text-center transition-colors border border-gray-600 shadow-lg"
            >
              <h4 className="text-lg font-semibold text-blue-400">
                🌱 Seed Database
              </h4>
              <p className="text-sm text-gray-300 mt-2">
                Populate database with sample events
              </p>
            </Link>
            <Link 
              href="/events"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 text-center transition-colors border border-gray-600 shadow-lg"
            >
              <h4 className="text-lg font-semibold text-purple-400">
                🎭 View Events
              </h4>
              <p className="text-sm text-gray-300 mt-2">
                Browse events with tier-based filtering
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
