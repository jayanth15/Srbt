"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { User } from "@/types"
import { api } from "@/lib/api"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<void>
  logout: () => void
  register: (data: {
    first_name: string
    last_name: string
    phone: string
    password: string
    email?: string
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = "srbt_token"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  })

  // Fetch user profile using stored token
  const fetchUser = useCallback(async (token: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error("Token invalid")
      const user: User = await res.json()
      setState({ user, token, isLoading: false })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setState({ user: null, token: null, isLoading: false })
    }
  }, [])

  // On mount, check for existing token
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
    if (stored) {
      fetchUser(stored)
    } else {
      setState({ user: null, token: null, isLoading: false })
    }
  }, [fetchUser])

  const login = useCallback(
    async (phone: string, password: string) => {
      const body = new URLSearchParams({ username: phone, password })
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Invalid credentials" }))
        throw new Error(err.detail ?? "Login failed")
      }
      const data = await res.json()
      localStorage.setItem(TOKEN_KEY, data.access_token)
      setState(prev => ({ ...prev, token: data.access_token }))
      // Fetch user profile
      await fetchUser(data.access_token)
    },
    [fetchUser]
  )

  const register = useCallback(
    async (data: {
      first_name: string
      last_name: string
      phone: string
      password: string
      email?: string
    }) => {
      await api.post("/api/v1/auth/register", data)
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setState({ user: null, token: null, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
