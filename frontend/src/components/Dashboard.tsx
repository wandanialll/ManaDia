import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import MapComponent from './MapComponent'
import LocationList from './LocationList'
import Controls from './Controls'
import { getLocations, Location } from '../api/client'
import './Dashboard.css'

export default function Dashboard() {
  const { username, logout } = useAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

  // Fetch locations on mount and set up polling
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        const response = await getLocations()
        setLocations(response.data.locations)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch locations')
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
    const interval = setInterval(fetchLocations, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = locations
    if (selectedUser) {
      filtered = filtered.filter(loc => loc.user === selectedUser)
    }
    if (selectedDevice) {
      filtered = filtered.filter(loc => loc.device === selectedDevice)
    }
    setFilteredLocations(filtered)
  }, [locations, selectedUser, selectedDevice])

  const uniqueUsers = [...new Set(locations.map(loc => loc.user))]
  const uniqueDevices = [...new Set(locations.flatMap(loc => loc.device ? [loc.device] : []))]

  if (loading && locations.length === 0) {
    return <div className="dashboard-loading">Loading locations...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="dashboard-header">
          <h1>Manadia Dashboard</h1>
          <div className="user-info">
            <span className="username">{username}</span>
            <button className="logout-btn" onClick={logout} title="Logout">
              ✕
            </button>
          </div>
        </div>
        <Controls
          users={uniqueUsers}
          devices={uniqueDevices}
          selectedUser={selectedUser}
          selectedDevice={selectedDevice}
          onUserChange={setSelectedUser}
          onDeviceChange={setSelectedDevice}
          onRefresh={() => location.reload()}
        />
        {error && <div className="error">{error}</div>}
        <LocationList locations={filteredLocations} />
      </div>
      <div className="dashboard-map">
        <MapComponent locations={filteredLocations} />
      </div>
    </div>
  )
}
