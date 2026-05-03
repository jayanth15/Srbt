"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { FileText, SlidersHorizontal, Loader2, Check, ChevronDown, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { AppHeader } from "@/components/shared/AppHeader"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  paid:    "bg-green-50 text-green-700 border-green-100",
}

interface InvoiceSummary {
  id: number; invoice_number: string; company_name?: string; customer_name?: string
  total_amount: number; status: string; created_at: string; paid_at?: string | null
  order_number?: string
}

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
    if (!open) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setLoading(true)
      api.get<{ id: number; name: string }[]>(fetchUrl(search))
        .then(setResults).catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer.current)
  }, [search, fetchUrl, open])

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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [loading, setLoading]   = useState(true)

  const [status, setStatus]         = useState("all")
  const [company, setCompany]       = useState<{ id: number; name: string } | null>(null)
  const [quickFilter, setQuickFilter] = useState("all")
  const [dateFrom, setDateFrom]     = useState("")
  const [dateTo, setDateTo]         = useState("")

  const fetchInvoices = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (status !== "all")      params.set("status",      status)
    if (company)               params.set("company_id",  String(company.id))
    if (quickFilter !== "all") params.set("quick_filter", quickFilter)
    if (dateFrom)              params.set("date_from",   dateFrom)
    if (dateTo)                params.set("date_to",     dateTo)

    api.get<{ items: InvoiceSummary[]; total: number; pages: number }>(`/api/v1/invoices/?${params}`)
      .then(r => { setInvoices(r.items); setTotal(r.total); setPages(r.pages) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, status, company, quickFilter, dateFrom, dateTo])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const clearFilters = () => {
    setStatus("all"); setCompany(null); setQuickFilter("all")
    setDateFrom(""); setDateTo(""); setPage(1)
  }

  const hasFilter = status !== "all" || company || quickFilter !== "all" || dateFrom || dateTo

  const companyFetchUrl = useCallback((s: string) =>
    `/api/v1/companies/?search=${encodeURIComponent(s)}&limit=5`, [])

  return (
    <div className="flex flex-col min-h-full bg-background">
      <AppHeader />
      {/* Header */}
      <div className="px-4 pt-2 pb-3 md:px-6 md:pt-5 border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold">Invoices</h1>
            <p className="text-xs text-muted-foreground">{total} invoices</p>
          </div>
          {hasFilter && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Row 1: Status + Quick date */}
        <div className="flex gap-2 mb-2">
          <Select value={status} onValueChange={v => { setStatus(v); setPage(1) }}>
            <SelectTrigger className="h-8 text-xs flex-1 min-w-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all"          className="text-xs">All invoices</SelectItem>
              <SelectItem value="pending"      className="text-xs">Pending</SelectItem>
              <SelectItem value="paid"         className="text-xs">Paid</SelectItem>
              <SelectItem value="not_invoiced" className="text-xs">Not yet invoiced</SelectItem>
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

        {/* Row 2: Company combobox */}
        <div className="flex gap-2 mb-2">
          <ServerCombobox label="All companies" placeholder="Search company…" value={company} onChange={c => { setCompany(c); setPage(1) }} fetchUrl={companyFetchUrl} />
        </div>

        {/* Row 3: Date pickers */}
        <div className="flex gap-2">
          <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className="h-8 text-xs flex-1" />
          <Input type="date" value={dateTo}   onChange={e => { setDateTo(e.target.value); setPage(1) }}   className="h-8 text-xs flex-1" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-3 md:px-6 flex flex-col gap-2 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">No invoices found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {status === "not_invoiced" ? "All delivered orders have been invoiced" : "Try adjusting filters"}
            </p>
          </div>
        ) : (
          <>
            {invoices.map(inv => {
              const displayName = inv.company_name || inv.customer_name || "—"
              const date = inv.paid_at
                ? `Paid ${new Date(inv.paid_at).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}`
                : new Date(inv.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" })
              return (
                <Link key={inv.id} href={`/invoices/${inv.id}`}>
                  <Card size="sm" className="hover:bg-accent transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-sm font-semibold truncate">{displayName}</p>
                          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0", statusStyles[inv.status] ?? "")}>
                            {inv.status === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{inv.invoice_number} {inv.order_number ? `· ${inv.order_number}` : ""}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground">{date}</p>
                          <p className="text-sm font-bold">₹{inv.total_amount.toLocaleString("en-IN")}</p>
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
    </div>
  )
}
