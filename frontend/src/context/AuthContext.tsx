import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  password: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)

  // Load credentials from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('manadia_auth')
    if (stored) {
      try {
        const { username, password } = JSON.parse(stored)
        setUsername(username)
        setPassword(password)
        setIsAuthenticated(true)
      } catch (err) {
        localStorage.removeItem('manadia_auth')
      }
    }
  }, [])

  const login = async (user: string, pass: string) => {
    try {
      // Test credentials by making an API call
      const credentials = btoa(`${user}:${pass}`)
      const response = await fetch('/api/health', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      })

      if (response.ok) {
        // Credentials work, store them
        localStorage.setItem('manadia_auth', JSON.stringify({ username: user, password: pass }))
        setUsername(user)
        setPassword(pass)
        setIsAuthenticated(true)
        return true
      }
      return false
    } catch (err) {
      console.error('Login error:', err)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('manadia_auth')
    setUsername(null)
    setPassword(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, password, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
