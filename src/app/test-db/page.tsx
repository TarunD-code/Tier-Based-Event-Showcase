'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDB() {
  const [status, setStatus] = useState('Testing connection...')
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setStatus('Connecting to Supabase...')
      
      // Test basic connection
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .limit(5)

      if (error) {
        setStatus(`❌ Error: ${error.message}`)
        return
      }

      setStatus(`✅ Connected! Found ${data?.length || 0} events`)
      setEvents(data || [])
    } catch (err) {
      setStatus(`❌ Connection failed: ${err}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">Database Connection Test</h1>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-white">Connection Status</h2>
          <div className="p-4 rounded-lg bg-gray-700 border border-gray-600">
            <p className="text-xl text-white">{status}</p>
          </div>
        </div>

        {events.length > 0 && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-white">Sample Events</h2>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                  <h3 className="font-semibold text-white text-lg">{event.title}</h3>
                  <p className="text-blue-300 font-medium">{event.tier} tier</p>
                  <p className="text-sm text-gray-400">{event.event_date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <a 
            href="/"
            className="text-blue-400 hover:text-blue-300 font-medium text-lg"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
} 