import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getClaims } from '../utils/jwt'

const AuthContext = createContext({ role: null, branch: null, userId: null })

export function AuthProvider({ children }) {
  const [claims, setClaims] = useState(() => getClaims())

  useEffect(() => {
    const handler = () => setClaims(getClaims())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const value = useMemo(() => ({
    role: claims?.role ?? null,
    branch: claims?.branch ?? null,
    userId: claims?.user_id ?? null,
  }), [claims])

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
