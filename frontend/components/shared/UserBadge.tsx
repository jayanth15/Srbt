"use client"

import { useAuth } from "@/context/auth-context"

export function UserBadge() {
  const { user } = useAuth()

  if (!user) return null

  const displayName = `${user.first_name} ${user.last_name.charAt(0)}.`
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1)

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground">{displayName} · {roleLabel}</span>
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
        {initials}
      </div>
    </div>
  )
}
