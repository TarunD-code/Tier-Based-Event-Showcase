'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SeedDB() {
  const [status, setStatus] = useState('Ready to seed database')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSeed = async () => {
    try {
      setLoading(true)
      setStatus('Seeding database...')
      
      const response = await fetch('/api/seed-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        setStatus('✅ Database seeded successfully!')
        setResult(data)
      } else {
        setStatus(`❌ Error: ${data.error}`)
        setResult(data)
      }
    } catch (error) {
      setStatus(`❌ Network error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">Database Seeding Tool</h1>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-white">Seed Database</h2>
          <p className="text-gray-300 mb-6 text-lg">
            This will populate the database with sample events for all tiers (Free, Silver, Gold, Platinum).
          </p>
          
          <button
            onClick={handleSeed}
            disabled={loading}
            className={`px-8 py-4 rounded-lg font-medium transition-colors text-lg ${
              loading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
            }`}
          >
            {loading ? '🔄 Seeding...' : '🌱 Seed Database'}
          </button>
          
          <div className="mt-6 p-4 rounded-lg bg-gray-700 border border-gray-600">
            <p className="text-lg font-medium text-white">{status}</p>
          </div>
        </div>

        {result && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-white">Result</h2>
            <pre className="bg-gray-900 p-6 rounded-lg overflow-auto text-sm text-green-300 border border-gray-600">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Link 
            href="/test-db"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
          >
            🗄️ Test Database Connection
          </Link>
          <Link 
            href="/events"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg"
          >
            🎭 View Events
          </Link>
          <Link 
            href="/"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-lg"
          >
            🏠 Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 