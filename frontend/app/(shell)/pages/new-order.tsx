"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Plus, Trash2, Loader2, Check, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

interface Company  { id: number; name: string; gst_number?: string; address?: string }
interface Material { id: number; name: string; unit: string; rate: number }
interface OrderItemInput { material: Material | null; qty: string }

function CompanyCombobox({ value, onChange }: { value: Company | null; onChange: (c: Company | null) => void }) {
  const [open, setOpen]       = useState(false)
  const [search, setSearch]   = useState("")
  const [results, setResults] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setLoading(true)
      api.get<Company[]>(`/api/v1/companies/?search=${encodeURIComponent(search)}&limit=5`)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer.current)
  }, [search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal gap-1 h-10 text-sm">
          <span className="truncate">{value ? value.name : "Select company"}</span>
          <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" sideOffset={4}>
        <Command>
          <CommandInput placeholder="Search company…" value={search} onValueChange={setSearch} />
          <CommandList className="max-h-52">
            <CommandEmpty>{loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto my-2" /> : "No results"}</CommandEmpty>
            <CommandGroup>
              {results.map(c => (
                <CommandItem key={c.id} value={c.name} onSelect={() => { onChange(c); setOpen(false) }}>
                  <Check className={cn("mr-2 w-4 h-4", value?.id === c.id ? "opacity-100" : "opacity-0")} />
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    {c.address && <p className="text-xs text-muted-foreground">{c.address}</p>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function MaterialCombobox({ value, onChange, index }: { value: Material | null; onChange: (m: Material | null) => void; index: number }) {
  const [open, setOpen]       = useState(false)
  const [search, setSearch]   = useState("")
  const [results, setResults] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setLoading(true)
      api.get<Material[]>(`/api/v1/materials/?search=${encodeURIComponent(search)}&limit=5`)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer.current)
  }, [search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex-1 justify-between font-normal gap-1 h-9 text-sm min-w-0">
          <span className="truncate">{value ? value.name : "Select product"}</span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" sideOffset={4}>
        <Command>
          <CommandInput placeholder="Search product…" value={search} onValueChange={setSearch} />
          <CommandList className="max-h-52">
            <CommandEmpty>{loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto my-2" /> : "No results"}</CommandEmpty>
            <CommandGroup>
              {results.map(m => (
                <CommandItem key={m.id} value={m.name} onSelect={() => { onChange(m); setOpen(false) }}>
                  <Check className={cn("mr-2 w-4 h-4", value?.id === m.id ? "opacity-100" : "opacity-0")} />
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">₹{m.rate}/{m.unit}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function NewOrderPage() {
  const router  = useRouter()
  const [company, setCompany]         = useState<Company | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliverySlot, setDeliverySlot] = useState("")
  const [poNumber, setPoNumber]       = useState("")
  const [items, setItems]             = useState<OrderItemInput[]>([{ material: null, qty: "" }])
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState("")

  // When company selected, prefill delivery address
  useEffect(() => {
    if (company?.address) setDeliveryAddress(company.address)
  }, [company])

  const addItem = () => setItems(prev => [...prev, { material: null, qty: "" }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i: number, patch: Partial<OrderItemInput>) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it))

  const subtotal = items.reduce((acc, it) => {
    if (!it.material || !it.qty) return acc
    return acc + it.material.rate * parseFloat(it.qty)
  }, 0)

  const handleSubmit = async () => {
    setError("")
    if (!company) return setError("Select a company")
    const validItems = items.filter(it => it.material && parseFloat(it.qty) > 0)
    if (validItems.length === 0) return setError("Add at least one item with quantity")
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const payload = {
        company_id:       company.id,
        customer_name:    customerName || company.name,
        customer_phone:   customerPhone,
        delivery_address: deliveryAddress,
        delivery_date:    deliveryDate || null,
        delivery_slot:    deliverySlot || null,
        po_number:        poNumber || null,
        items: validItems.map(it => ({
          material_id: it.material!.id,
          qty:  parseFloat(it.qty),
          unit: it.material!.unit,
          rate: it.material!.rate,
        })),
      }
      const res = await api.post<{ id: number }>("/api/v1/orders/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      router.push(`/orders/${res.id}`)
    } catch (e: any) {
      setError(e?.message ?? "Failed to create order")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Top bar */}
      <div className="sticky top-0 bg-background z-10 flex items-center gap-3 px-4 md:px-6 h-12 border-b">
        <Link href="/orders" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /><span>Orders</span>
        </Link>
        <p className="text-sm font-semibold ml-auto">New Order</p>
      </div>

      <div className="px-4 py-4 md:px-6 flex flex-col gap-5">
        {/* Company */}
        <section className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer (Company)</p>
          <CompanyCombobox value={company} onChange={setCompany} />
        </section>

        {/* Contact */}
        <section className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact (optional)</p>
          <Input placeholder="Contact name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-10" />
          <Input type="tel" placeholder="Phone number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="h-10" />
        </section>

        {/* Delivery */}
        <section className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Delivery</p>
          <Textarea placeholder="Delivery address" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="min-h-[72px]" />
          <div className="flex gap-2">
            <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="h-10 flex-1" />
            <Select value={deliverySlot} onValueChange={setDeliverySlot}>
              <SelectTrigger className="h-10 flex-1">
                <SelectValue placeholder="Time slot" />
              </SelectTrigger>
              <SelectContent position="popper">
                {["Morning (8–12)","Afternoon (12–4)","Evening (4–8)"].map(s => (
                  <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="PO number (optional)" value={poNumber} onChange={e => setPoNumber(e.target.value)} className="h-10" />
        </section>

        {/* Items */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Products</p>
            <button onClick={addItem} className="flex items-center gap-1 text-xs text-primary font-medium">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {items.map((item, i) => (
            <Card key={i} size="sm">
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <MaterialCombobox value={item.material} onChange={m => updateItem(i, { material: m })} index={i} />
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" min="0" step="0.01" placeholder="Quantity"
                    value={item.qty} onChange={e => updateItem(i, { qty: e.target.value })}
                    className="h-9 flex-1 text-sm" />
                  <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
                    {item.material?.unit ?? "unit"}
                  </span>
                </div>
                {item.material && item.qty && parseFloat(item.qty) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    = ₹{(item.material.rate * parseFloat(item.qty)).toLocaleString("en-IN")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Total */}
        {subtotal > 0 && (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/60">
            <p className="text-sm font-medium">Subtotal</p>
            <p className="text-base font-bold">₹{subtotal.toLocaleString("en-IN")}</p>
          </div>
        )}

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <Button size="lg" onClick={handleSubmit} disabled={submitting} className="mt-1">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Place Order"}
        </Button>
      </div>
    </div>
  )
}
