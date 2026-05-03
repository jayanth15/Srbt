"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState("")
  const [form, setForm]           = useState({
    name:        "",
    description: "",
    category:    "Aggregates",
    unit:        "Ton",
    rate:        "",
    stock_level: "high",
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.rate) {
      setError("Name and rate are required")
      return
    }
    setSaving(true)
    setError("")
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      await api.post(
        "/api/v1/materials/",
        { ...form, rate: Number(form.rate) },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      )
      router.push("/products")
    } catch (e: any) {
      setError(e.message ?? "Failed to create product")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="px-4 pt-4 pb-3 md:px-6 md:pt-5 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-base font-bold">New Product</h1>
      </div>

      <div className="px-4 py-4 md:px-6 md:py-5 space-y-4">
        <Card size="sm">
          <CardHeader><CardTitle>Product details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name *</label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Aggregate 20mm" className="mt-1 h-10 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
              <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="e.g. Blue Metal" className="mt-1 h-10 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
                <Select value={form.category} onValueChange={v => set("category", v)}>
                  <SelectTrigger className="mt-1 h-10 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sand">Sand</SelectItem>
                    <SelectItem value="Aggregates">Aggregates</SelectItem>
                    <SelectItem value="Dust">Dust</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unit</label>
                <Select value={form.unit} onValueChange={v => set("unit", v)}>
                  <SelectTrigger className="mt-1 h-10 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ton">Ton</SelectItem>
                    <SelectItem value="Unit (100 cft)">Unit (100 cft)</SelectItem>
                    <SelectItem value="Cubic Metre">Cubic Metre</SelectItem>
                    <SelectItem value="Bag">Bag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rate (₹) *</label>
                <Input type="number" inputMode="numeric" value={form.rate} onChange={e => set("rate", e.target.value)} placeholder="950" className="mt-1 h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stock Status</label>
                <Select value={form.stock_level} onValueChange={v => set("stock_level", v)}>
                  <SelectTrigger className="mt-1 h-10 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">In Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="px-4 pb-6 pt-3 bg-background border-t border-border md:px-6">
        <Button className="w-full h-12 text-sm font-semibold" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Product"}
        </Button>
      </div>
    </div>
  )
}
