import { Sidebar } from "@/components/shared/Sidebar"
import { BottomNav } from "@/components/shared/BottomNav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-gray-50 flex">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh]">
        {/* Desktop top bar */}
        <header className="hidden md:flex h-14 bg-white border-b border-gray-100 items-center justify-between px-6 shrink-0">
          <span className="text-sm font-semibold text-gray-700">SRBT Portal</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Karthik · Admin</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">K</div>
          </div>
        </header>

        {/* Scrollable content wrapper — nav is sticky inside here */}
        <div className="flex-1 overflow-y-scroll flex flex-col">
          <main className="flex-1">
            {children}
          </main>

          {/* Mobile bottom nav — sticky at bottom of scrollport */}
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
