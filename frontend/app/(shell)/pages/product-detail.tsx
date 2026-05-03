"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Edit2, Package, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import type { Material } from "./products"

const swatchGradient: Record<string, string> = {
  Sand:       "from-amber-100 to-amber-50",
  Aggregates: "from-blue-200 to-blue-100",
  Dust:       "from-stone-200 to-stone-100",
}

interface Props { sku: string }   // sku is actually the id from the URL

export default function ProductDetailPage({ sku }: Props) {
  const router   = useRouter()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading]   = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft]       = useState<Material | null>(null)
  const [saving, setSaving]     = useState(false)
  const [imgUploading, setImgUploading] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    api.get<Material>(`/api/v1/materials/${sku}`)
      .then(m => { setMaterial(m); setDraft(m) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [sku])

  const openEdit  = () => { setDraft(material ? { ...material } : null); setEditOpen(true) }
  const saveEdit  = async () => {
    if (!draft) return
    setSaving(true)
    try {
      const updated = await api.put<Material>(
        `/api/v1/materials/${draft.id}`,
        { name: draft.name, description: draft.description, category: draft.category, unit: draft.unit, rate: draft.rate, stock_level: draft.stock_level },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      )
      setMaterial(updated)
      setEditOpen(false)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleImageFile = async (file: File) => {
    if (!material) return
    setImgUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/materials/${material.id}/image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      setMaterial(m => m ? { ...m, image_base64: data.image_base64 } : m)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setImgUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-3 text-muted-foreground">
        <Package className="w-10 h-10 opacity-30" />
        <p className="text-sm">Product not found</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>Go back</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 md:px-6 md:pt-5 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-base font-bold flex-1">Product Detail</h1>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={openEdit}>
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </Button>
      </div>

      <div className="px-4 py-4 md:px-6 md:py-5 space-y-4">
        {/* Hero image / swatch */}
        <div
          className={cn(
            "relative h-40 rounded-xl bg-gradient-to-br flex items-end p-4 overflow-hidden",
            swatchGradient[material.category] ?? "from-muted to-muted/50"
          )}
        >
          {material.image_base64 ? (
            <img src={material.image_base64} alt={material.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 rounded-xl opacity-20"
              style={{ backgroundImage: "repeating-linear-gradient(45deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%)", backgroundSize: "8px 8px" }} />
          )}
          <div className="relative z-10">
            <Badge variant="outline" className="text-xs font-bold bg-background/80 border-0 mb-2">{material.category}</Badge>
            <h2 className="text-2xl font-bold">{material.name}</h2>
            <p className="text-sm text-foreground/70">{material.description}</p>
          </div>
          {/* Image upload overlay button */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={imgUploading}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
          >
            {imgUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }} />
        </div>

        <Card size="sm">
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {[
              { label: "Category", value: material.category },
              { label: "Unit",     value: material.unit },
              { label: "Rate",     value: `₹${material.rate.toLocaleString("en-IN")} per ${material.unit}` },
            ].map(({ label, value }, i, arr) => (
              <div key={label}>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
                {i < arr.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader><CardTitle>Stock Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Availability</span>
              <div className={cn("flex items-center gap-1.5 text-sm font-semibold",
                material.stock_level === "low" ? "text-amber-600" :
                material.stock_level === "out" ? "text-red-600"   : "text-green-600")}>
                <span className={cn("w-2 h-2 rounded-full",
                  material.stock_level === "low" ? "bg-amber-500" :
                  material.stock_level === "out" ? "bg-red-500"   : "bg-green-500")} />
                {material.stock_level === "low" ? "LOW STOCK" : material.stock_level === "out" ? "OUT OF STOCK" : "IN STOCK"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader><CardTitle>Tax</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {[
              { label: "GST Rate", value: "5%" },
              { label: "CGST",     value: "2.5%" },
              { label: "SGST",     value: "2.5%" },
            ].map(({ label, value }, i, arr) => (
              <div key={label}>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
                {i < arr.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Edit Sheet */}
      {draft && (
        <Sheet open={editOpen} onOpenChange={setEditOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl p-0 max-h-[85vh] flex flex-col">
            <SheetHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
              <SheetTitle>Edit {material.name}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                <Input value={draft.name} onChange={e => setDraft(d => d ? { ...d, name: e.target.value } : d)}
                  className="mt-1 h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
                <Input value={draft.description} onChange={e => setDraft(d => d ? { ...d, description: e.target.value } : d)}
                  className="mt-1 h-10 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
                  <Select value={draft.category} onValueChange={v => setDraft(d => d ? { ...d, category: v } : d)}>
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
                  <Select value={draft.unit} onValueChange={v => setDraft(d => d ? { ...d, unit: v } : d)}>
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
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rate (₹ per {material.unit})</label>
                <Input type="number" inputMode="numeric" value={draft.rate}
                  onChange={e => setDraft(d => d ? { ...d, rate: Number(e.target.value) } : d)}
                  className="mt-1 h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stock Status</label>
                <Select value={draft.stock_level} onValueChange={v => setDraft(d => d ? { ...d, stock_level: v } : d)}>
                  <SelectTrigger className="mt-1 h-10 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">In Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border shrink-0 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={saveEdit} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
