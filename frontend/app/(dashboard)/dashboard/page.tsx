import Link from "next/link"
import { AppHeader } from "@/components/shared/AppHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Truck, MapPin, ChevronRight, Plus } from "lucide-react"

const stats = [
  { icon: ShoppingCart, value: "3", label: "Orders", sub: "+3 vs yest", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { icon: Truck, value: "42", label: "Tons · dispatched", sub: null, iconBg: "bg-green-50", iconColor: "text-green-600" },
  { icon: MapPin, value: "2", label: "Vehicles · in rotation", sub: null, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
]

const pipeline = [
  { label: "Pending", count: 1, color: "bg-amber-400", trackColor: "bg-amber-100", value: 33 },
  { label: "In transit", count: 1, color: "bg-blue-500", trackColor: "bg-blue-100", value: 33 },
  { label: "Delivered", count: 1, color: "bg-green-500", trackColor: "bg-green-100", value: 33 },
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
    site: "Avadi · Site 3", time: "Today · 10:45",
    avatarBg: "bg-blue-600",
  },
  {
    initials: "VB", name: "Vetri Builders", status: "Delivered",
    orderId: "SRBT-2840", detail: "12mm Aggregate × 24t",
    site: "Poonamallee", time: "Today · 09:10",
    avatarBg: "bg-green-600",
  },
  {
    initials: "MR", name: "Self · Murugan R.", status: "Pending",
    orderId: "SRBT-2839", detail: "P-Sand × 2u, Quarry Dust × 6t",
    site: "Tambaram East", time: "Today · 08:00",
    avatarBg: "bg-gray-500",
  },
]

export default function DashboardPage() {
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile header */}
      <AppHeader />

      <div className="px-4 pt-1 pb-4 md:px-8 md:pt-8 space-y-5">

        {/* Greeting — mobile */}
        <div className="md:hidden">
          <p className="text-sm text-gray-500">{dateStr} · Free delivery within 15 km</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">Order materials, fast.</h1>
        </div>

        {/* Desktop heading */}
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dateStr}</p>
        </div>

        {/* Hero CTA */}
        <Link href="/orders/new">
          <Card className="bg-gradient-to-br from-blue-700 to-blue-500 border-0 cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
            <CardContent className="p-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200 mb-2">
                <Plus className="w-3.5 h-3.5" /> NEW ORDER
              </span>
              <h2 className="text-xl font-bold text-white mb-1">Schedule a delivery</h2>
              <p className="text-sm text-blue-200 mb-4">Pick materials, slot a date, we'll handle the rest.</p>
              <div className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                Start order <ChevronRight className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Stats */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-semibold text-gray-700">Today</p>
            <p className="text-xs text-gray-400">
              {now.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {stats.map(({ icon: Icon, value, label, sub, iconBg, iconColor }) => (
              <Card key={label} className="border-gray-100 shadow-none">
                <CardContent className="p-2 md:p-4 flex items-center gap-2 md:block">
                  <div className={`w-6 h-6 md:w-10 md:h-10 rounded-md md:rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-3 h-3 md:w-5 md:h-5 ${iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg md:text-2xl font-bold text-gray-900 leading-none">{value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{label}</p>
                    {sub && <p className="text-[9px] text-green-600 font-medium mt-0.5">{sub}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <Card className="border-gray-100 shadow-none">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Pipeline</p>
            <div className="space-y-3">
              {pipeline.map(({ label, count, color, trackColor, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-24 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  <div className={`flex-1 h-2 rounded-full ${trackColor} overflow-hidden`}>
                    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 w-14 text-right">{count} orders</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-semibold text-gray-700">Recent orders</p>
            <Link href="/orders" className="text-xs text-blue-600 font-medium hover:underline">
              See all
            </Link>
          </div>
          <Card className="border-gray-100 shadow-none divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <Link key={order.orderId} href={`/orders/${order.orderId}`}>
                <div className="flex items-start gap-3 p-3.5 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`w-9 h-9 rounded-full ${order.avatarBg} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
                    {order.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{order.name}</p>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${statusStyles[order.status]}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{order.orderId} · {order.detail}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-300 shrink-0" />
                      <p className="text-[11px] text-gray-400 truncate">{order.site}</p>
                      <span className="text-gray-200">·</span>
                      <p className="text-[11px] text-gray-400 shrink-0">{order.time}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </Card>
        </div>

      </div>
    </div>
  )
}
