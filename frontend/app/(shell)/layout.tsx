import { Sidebar } from "@/components/shared/Sidebar"
import { BottomNav } from "@/components/shared/BottomNav"
import { UserBadge } from "@/components/shared/UserBadge"
import { AuthGuard } from "@/components/auth-guard"

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-[100dvh] bg-background flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-[100dvh]">
          <header className="hidden md:flex h-12 bg-background border-b border-border items-center justify-between px-6 shrink-0">
            <span className="text-sm font-semibold">SRBT Portal</span>
            <UserBadge />
          </header>
          <div className="flex-1 overflow-y-scroll flex flex-col">
            <main className="flex-1">
              <div className="md:max-w-5xl md:mx-auto md:w-full">
                {children}
              </div>
            </main>
            <BottomNav />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
