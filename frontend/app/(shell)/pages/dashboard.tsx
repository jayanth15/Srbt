import Link from "next/link"
import { AppHeader } from "@/components/shared/AppHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ShoppingCart, Truck, MapPin, ChevronRight, Plus } from "lucide-react"

const stats = [
  { icon: ShoppingCart, value: "3", label: "Orders", sub: "+3 vs yest", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { icon: Truck, value: "42", label: "Dispatched", sub: null, iconBg: "bg-green-50", iconColor: "text-green-600" },
]

const pipeline = [
  { label: "Pending", count: 1, color: "bg-amber-400", indicatorClass: "[&>[data-slot=progress-indicator]]:bg-amber-400", value: 33 },
  { label: "In transit", count: 1, color: "bg-blue-500", indicatorClass: "[&>[data-slot=progress-indicator]]:bg-blue-500", value: 33 },
  { label: "Delivered", count: 1, color: "bg-green-500", indicatorClass: "[&>[data-slot=progress-indicator]]:bg-green-500", value: 33 },
]

const statusStyles: Record<string, string> = {
  "In transit": "bg-blue-50 text-blue-600 border-blue-100",
  "Delivered": "bg-green-50 text-green-700 border-green-100",
  "Pending": "bg-amber-50 text-amber-700 border-amber-100",
}

const recentOrders = [
  {
    initials: "AC", name: "Anbu Constructions", status: "In transit",
    orderId: "SRBT-2841", detail: "20mm Aggregate × 16t, M-Sand × 1u",
    site: "Avadi · Site 3", time: "Today · 10:45", avatarBg: "bg-blue-600",
  },
  {
    initials: "VB", name: "Vetri Builders", status: "Delivered",
    orderId: "SRBT-2840", detail: "12mm Aggregate × 24t",
    site: "Poonamallee", time: "Today · 09:10", avatarBg: "bg-green-600",
  },
  {
    initials: "MR", name: "Self · Murugan R.", status: "Pending",
    orderId: "SRBT-2839", detail: "P-Sand × 2u, Quarry Dust × 6t",
    site: "Tambaram East", time: "Today · 08:00", avatarBg: "bg-gray-500",
  },
  {
    initials: "SK", name: "Sri Krishna Infra", status: "Delivered",
    orderId: "SRBT-2838", detail: "M-Sand × 3u, Jelly × 8t",
    site: "Ambattur", time: "Yesterday · 16:30", avatarBg: "bg-indigo-600",
  },
]

export default function DashboardPage() {
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader />

      <div className="px-4 pt-1 pb-4 md:px-8 md:pt-8 flex flex-col gap-6">

        {/* Greeting — mobile */}
        <div className="md:hidden">
          <p className="text-sm text-muted-foreground">{dateStr} · Free delivery within 15 km</p>
          <h1 className="text-2xl font-bold mt-0.5">Order materials, fast.</h1>
        </div>

        {/* Desktop heading */}
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
        </div>

        {/* Hero CTA */}
        <Link href="/orders/new">
          <Card className="bg-gradient-to-br from-blue-700 to-blue-500 border-0 text-white cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-5 md:p-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200 mb-2">
                <Plus className="w-3.5 h-3.5" /> NEW ORDER
              </span>
              <h2 className="text-xl font-bold mb-1">Schedule a delivery</h2>
              <p className="text-sm text-blue-200 mb-4">Pick materials, slot a date, we'll handle the rest.</p>
              <div className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                Start order <ChevronRight className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Stats */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Today</p>
            <p className="text-xs text-muted-foreground">
              {now.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon: Icon, value, label, sub, iconBg, iconColor }) => (
              <Card key={label} size="sm">
                <CardContent className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    {sub && <p className="text-xs text-green-600 font-medium mt-0.5">{sub}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pipeline */}
        <Card size="sm">
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardAction>
              <Link href="/orders" className="text-xs text-blue-600 font-medium hover:underline">See all</Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipeline.map(({ label, count, color, indicatorClass, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-24 shrink-0">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-sm">{label}</span>
                </div>
                <Progress value={value} className={`flex-1 h-2 ${indicatorClass}`} />
                <span className="text-xs font-semibold text-muted-foreground w-14 text-right">{count} orders</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Recent orders</p>
            <Link href="/orders" className="text-xs text-blue-600 font-medium hover:underline">See all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <Link key={order.orderId} href={`/orders/${order.orderId}`}>
                <Card size="sm" className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="flex items-start gap-3">
                    <Avatar className={`w-9 h-9 shrink-0 ${order.avatarBg}`}>
                      <AvatarFallback className={`text-xs font-bold text-white ${order.avatarBg}`}>
                        {order.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-sm font-semibold truncate">{order.name}</p>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${statusStyles[order.status]}`}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{order.orderId} · {order.detail}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                        <p className="text-[11px] text-muted-foreground truncate">{order.site}</p>
                        <span className="text-muted-foreground/30">·</span>
                        <p className="text-[11px] text-muted-foreground shrink-0">{order.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
