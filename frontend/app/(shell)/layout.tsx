import { Sidebar } from "@/components/shared/Sidebar"
import { BottomNav } from "@/components/shared/BottomNav"

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh]">
        <header className="hidden md:flex h-12 bg-background border-b border-border items-center justify-between px-6 shrink-0">
          <span className="text-sm font-semibold">SRBT Portal</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Karthik · Admin</span>
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">K</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-scroll flex flex-col">
          <main className="flex-1">
            {/* Desktop: constrain content width to avoid huge layouts */}
            <div className="md:max-w-5xl md:mx-auto md:w-full">
              {children}
            </div>
          </main>
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
