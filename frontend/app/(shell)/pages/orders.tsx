"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Plus, MapPin, SlidersHorizontal, X, FileText, ChevronDown, Check, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppHeader } from "@/components/shared/AppHeader"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

const statusStyles: Record<string, string> = {
  dispatched: "bg-blue-50 text-blue-600 border-blue-100",
  delivered:  "bg-green-50 text-green-700 border-green-100",
  pending:    "bg-amber-50 text-amber-700 border-amber-100",
  confirmed:  "bg-indigo-50 text-indigo-700 border-indigo-100",
  cancelled:  "bg-red-50 text-red-600 border-red-100",
}

const statusLabel: Record<string, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  dispatched: "In transit",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
}

interface OrderItem { id: number; material_name_snapshot: string; qty: number; unit: string; status: string }
interface Order {
  id: number; order_number: string; customer_name: string; company_name?: string
  delivery_address: string; created_at: string; status: string
  items: OrderItem[]; total_amount?: number
}

interface Company  { id: number; name: string }
interface Material { id: number; name: string }

// Server-side combobox
function ServerCombobox({
  label, placeholder, value, onChange, fetchUrl,
}: {
  label: string; placeholder: string
  value: { id: number; name: string } | null
  onChange: (v: { id: number; name: string } | null) => void
  fetchUrl: (search: string) => string
}) {
  const [open, setOpen]       = useState(false)
  const [search, setSearch]   = useState("")
  const [results, setResults] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setLoading(true)
      api.get<{ id: number; name: string }[]>(fetchUrl(search))
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer.current)
  }, [search, fetchUrl])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8 text-xs flex-1 min-w-0 justify-between font-normal gap-1 px-2">
          <span className="truncate">{value ? value.name : label}</span>
          <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start" sideOffset={4}>
        <Command>
          <CommandInput placeholder={placeholder} value={search} onValueChange={setSearch} />
          <CommandList className="max-h-48">
            <CommandEmpty>{loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto my-2" /> : "No results"}</CommandEmpty>
            <CommandGroup>
              {value && (
                <CommandItem onSelect={() => { onChange(null); setOpen(false) }}>
                  <X className="w-3 h-3 mr-2 text-muted-foreground" /> Clear filter
                </CommandItem>
              )}
              {results.map(r => (
                <CommandItem key={r.id} value={r.name} onSelect={() => { onChange(r); setOpen(false) }}>
                  <Check className={cn("mr-2 w-4 h-4", value?.id === r.id ? "opacity-100" : "opacity-0")} />
                  {r.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function OrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [pages, setPages]           = useState(1)
  const [loading, setLoading]       = useState(true)

  const [status, setStatus]         = useState("all")
  const [company, setCompany]       = useState<{ id: number; name: string } | null>(null)
  const [product, setProduct]       = useState<{ id: number; name: string } | null>(null)
  const [quickFilter, setQuickFilter] = useState("all")
  const [dateFrom, setDateFrom]     = useState("")
  const [dateTo, setDateTo]         = useState("")

  const fetchOrders = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (status !== "all")   params.set("status",       status)
    if (company)            params.set("company_id",   String(company.id))
    if (product)            params.set("material_id",  String(product.id))
    if (quickFilter !== "all") params.set("quick_filter", quickFilter)
    if (dateFrom)           params.set("date_from",    dateFrom)
    if (dateTo)             params.set("date_to",      dateTo)

    api.get<{ items: Order[]; total: number; pages: number }>(`/api/v1/orders/?${params}`)
      .then(r => { setOrders(r.items); setTotal(r.total); setPages(r.pages) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, status, company, product, quickFilter, dateFrom, dateTo])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const clearFilters = () => {
    setStatus("all"); setCompany(null); setProduct(null)
    setQuickFilter("all"); setDateFrom(""); setDateTo("")
    setPage(1)
  }

  const hasFilter = status !== "all" || company || product || quickFilter !== "all" || dateFrom || dateTo

  const statusCounts = {
    pending:    orders.filter(o => o.status === "pending").length,
    dispatched: orders.filter(o => o.status === "dispatched").length,
    delivered:  orders.filter(o => o.status === "delivered").length,
  }

  const companyFetchUrl = useCallback((s: string) =>
    `/api/v1/companies/?search=${encodeURIComponent(s)}&limit=5`, [])
  const productFetchUrl = useCallback((s: string) =>
    `/api/v1/materials/?search=${encodeURIComponent(s)}&limit=5`, [])

  return (
    <div className="flex flex-col min-h-full bg-background">
      <AppHeader />
      {/* Header */}
      <div className="px-4 pt-2 pb-3 md:px-6 md:pt-5 border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold">Orders</h1>
            <p className="text-xs text-muted-foreground">{total} orders</p>
          </div>
          {hasFilter && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Status pills */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-0.5 scrollbar-none">
          {(Object.entries(statusCounts) as [string, number][]).map(([st, count]) => (
            <button
              key={st}
              onClick={() => { setStatus(s => s === st ? "all" : st); setPage(1) }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0 transition-colors",
                statusStyles[st],
                status === st ? "ring-2 ring-offset-1 ring-current" : ""
              )}
            >
              {statusLabel[st] ?? st} <span className="font-bold">{count}</span>
            </button>
          ))}
        </div>

        {/* Row 1: Status + Quick date */}
        <div className="flex gap-2 mb-2">
          <Select value={status} onValueChange={v => { setStatus(v); setPage(1) }}>
            <SelectTrigger className="h-8 text-xs flex-1 min-w-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all" className="text-xs">All status</SelectItem>
              {["pending","confirmed","dispatched","delivered","cancelled"].map(s => (
                <SelectItem key={s} value={s} className="text-xs">{statusLabel[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={quickFilter} onValueChange={v => { setQuickFilter(v); setPage(1) }}>
            <SelectTrigger className="h-8 text-xs flex-1 min-w-0">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all"        className="text-xs">All time</SelectItem>
              <SelectItem value="today"      className="text-xs">Today</SelectItem>
              <SelectItem value="last30"     className="text-xs">Last 30 days</SelectItem>
              <SelectItem value="last_month" className="text-xs">Last month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Company + Product comboboxes */}
        <div className="flex gap-2 mb-2">
          <ServerCombobox label="All companies" placeholder="Search company…" value={company} onChange={c => { setCompany(c); setPage(1) }} fetchUrl={companyFetchUrl} />
          <ServerCombobox label="All products"  placeholder="Search product…" value={product} onChange={p => { setProduct(p); setPage(1) }} fetchUrl={productFetchUrl} />
        </div>

        {/* Row 3: Date range pickers */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
              className="h-8 text-xs" placeholder="From" />
          </div>
          <div className="flex-1">
            <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
              className="h-8 text-xs" placeholder="To" />
          </div>
        </div>
      </div>

      {/* Order list */}
      <div className="flex-1 px-4 py-3 md:px-6 flex flex-col gap-2 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SlidersHorizontal className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">No orders found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting filters</p>
          </div>
        ) : (
          <>
            {orders.map((order) => {
              const displayName = order.company_name || order.customer_name || "—"
              const initials    = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
              const summary     = order.items.map(i => `${i.material_name_snapshot} ×${i.qty}${i.unit === "Ton" ? "t" : "u"}`).join(", ")
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card size="sm" className="hover:bg-accent transition-colors cursor-pointer">
                    <CardContent className="flex items-start gap-3">
                      <Avatar className="w-9 h-9 shrink-0 bg-blue-600">
                        <AvatarFallback className="bg-blue-600 text-xs font-bold text-white">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-sm font-semibold truncate">{displayName}</p>
                          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0", statusStyles[order.status])}>
                            {statusLabel[order.status] ?? order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{order.order_number} · {summary || "No items"}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                          <p className="text-[11px] text-muted-foreground truncate">{order.delivery_address || "—"}</p>
                          {order.total_amount != null && (
                            <>
                              <span className="text-muted-foreground/30">·</span>
                              <p className="text-[11px] font-medium text-muted-foreground shrink-0">₹{order.total_amount.toLocaleString("en-IN")}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <span className="text-xs text-muted-foreground">{page} / {pages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>

      <Link
        href="/orders/new"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-8 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all z-20"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </Link>
    </div>
  )
}
