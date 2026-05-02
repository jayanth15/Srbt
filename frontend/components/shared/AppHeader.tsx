"use client"

import { Bell, Menu } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AppHeaderProps {
  title?: string
  subtitle?: string
  showGreeting?: boolean
}

export function AppHeader({ title, subtitle, showGreeting = false }: AppHeaderProps) {
  return (
    <header className="bg-white px-4 pt-4 pb-3 md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-9 h-9 bg-blue-600">
            <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">R</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-gray-900">Sri Raghavendra</p>
            <p className="text-[10px] font-bold text-blue-500 tracking-widest uppercase">Blue Metals</p>
          </div>
        </div>
        <div className="relative">
          <Button variant="ghost" size="icon" className="w-9 h-9">
            <Bell className="w-5 h-5 text-gray-500" />
          </Button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
        </div>
      </div>
    </header>
  )
}
