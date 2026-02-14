import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import './App.css'

function AppContent() {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Login />
  }

  return <Dashboard />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
