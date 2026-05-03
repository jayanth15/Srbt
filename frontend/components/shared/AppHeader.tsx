"use client"

import { useRouter } from "next/navigation"
import { Bell, Settings, Users, Package, LogOut, ChevronRight, Building2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"

export function AppHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : "?"

  const handleSignOut = () => {
    logout()
    router.push("/login")
  }

  const menuSections = [
    {
      title: "Manage",
      items: [
        { icon: Users, label: "Customers", disabled: true },
        { icon: Package, label: "Products & Pricing", disabled: true },
        { icon: Building2, label: "Sites", disabled: true },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: Settings, label: "Settings", disabled: true },
        { icon: LogOut, label: "Sign out", action: handleSignOut },
      ],
    },
  ]

  return (
    <header className="bg-white px-4 pt-4 pb-3 md:hidden">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <Avatar className="w-9 h-9 bg-blue-600">
            <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-gray-900">Sri Raghavendra</p>
            <p className="text-[10px] font-bold text-blue-500 tracking-widest uppercase">Blue Metals</p>
          </div>
        </div>

        {/* Right: bell + user sheet */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-9 h-9 text-gray-500">
            <Bell className="w-5 h-5" />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <Avatar className="w-7 h-7 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
                {user ? (
                  <>
                    <SheetTitle className="text-left text-base">
                      {user.first_name} {user.last_name}
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground text-left">
                      {user.phone} · {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </p>
                  </>
                ) : (
                  <SheetTitle className="text-left text-base">Menu</SheetTitle>
                )}
              </SheetHeader>
              <div className="py-2">
                {menuSections.map((section, si) => (
                  <div key={section.title} className={si > 0 ? "mt-2 pt-2 border-t border-border" : ""}>
                    <p className="px-5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {section.title}
                    </p>
                    {section.items.map(({ icon: Icon, label, action, disabled }) => (
                      <button
                        key={label}
                        onClick={action}
                        disabled={disabled}
                        className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          {label}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
