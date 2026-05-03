"use client"

import { Bell, Settings, Users, Package, LogOut, ChevronRight, Building2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const menuSections = [
  {
    title: "Manage",
    items: [
      { icon: Users,    label: "Customers"          },
      { icon: Package,  label: "Products & Pricing" },
      { icon: Building2, label: "Sites"             },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Settings, label: "Settings" },
      { icon: LogOut,   label: "Sign out"  },
    ],
  },
]

export function AppHeader() {
  return (
    <header className="bg-white px-4 pt-4 pb-3 md:hidden">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <Avatar className="w-9 h-9 bg-blue-600">
            <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">R</AvatarFallback>
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
                <Avatar className="w-7 h-7 bg-gray-200">
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-bold">K</AvatarFallback>
                </Avatar>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
                <SheetTitle className="text-left text-base">Menu</SheetTitle>
              </SheetHeader>
              <div className="py-2">
                {menuSections.map((section, si) => (
                  <div key={section.title} className={si > 0 ? "mt-2 pt-2 border-t border-border" : ""}>
                    <p className="px-5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {section.title}
                    </p>
                    {section.items.map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium hover:bg-accent transition-colors"
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
