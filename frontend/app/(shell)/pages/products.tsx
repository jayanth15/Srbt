"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AppHeader } from "@/components/shared/AppHeader"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

export interface Material {
  id:           number
  name:         string
  description:  string
  category:     string
  unit:         string
  rate:         number
  stock_tons:   number
  stock_level:  string  // high | low | out
  image_base64: string | null
  is_active:    boolean
}

const swatchGradient: Record<string, string> = {
  Sand:       "from-amber-100 to-amber-50",
  Aggregates: "from-blue-200 to-blue-100",
  Dust:       "from-stone-200 to-stone-100",
}

export default function ProductsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [search, setSearch]       = useState("")
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      api.get<Material[]>(`/api/v1/materials/?search=${encodeURIComponent(search)}&limit=100`)
        .then(setMaterials)
        .catch(console.error)
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader />
      {/* Header */}
      <div className="bg-background px-4 pt-3 pb-3 md:px-6 md:pt-5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold md:text-xl">Products</h1>
          <Badge variant="outline" className="text-xs text-muted-foreground">{materials.length} items</Badge>
        </div>
        <Input
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      <div className="p-4 md:px-6 md:py-5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {materials.map((m) => (
              <Link key={m.id} href={`/products/${m.id}`}>
                <Card size="sm" className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer p-0 gap-0">
                  <div className={cn(
                    "relative h-24 bg-gradient-to-br flex items-end p-2",
                    swatchGradient[m.category] ?? "from-muted to-muted/50"
                  )}>
                    {m.image_base64 ? (
                      <img src={m.image_base64} alt={m.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: "repeating-linear-gradient(45deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%)", backgroundSize: "8px 8px" }}
                      />
                    )}
                    <Badge variant="outline" className="relative z-10 text-[10px] font-bold bg-background/80 border-0 px-1.5 py-0">
                      {m.category}
                    </Badge>
                  </div>
                  <CardContent className="pt-3 pb-3">
                    <p className="text-sm font-semibold leading-tight">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{m.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[11px] text-muted-foreground">per {m.unit}</p>
                      <div className={cn(
                        "flex items-center gap-1 text-[10px] font-semibold",
                        m.stock_level === "low"  ? "text-amber-600" :
                        m.stock_level === "out"  ? "text-red-600"   : "text-green-600"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full",
                          m.stock_level === "low"  ? "bg-amber-500" :
                          m.stock_level === "out"  ? "bg-red-500"   : "bg-green-500"
                        )} />
                        {m.stock_level === "low" ? "LOW STOCK" : m.stock_level === "out" ? "OUT OF STOCK" : "IN STOCK"}
                      </div>
                    </div>
                    <p className="text-sm font-bold mt-1">₹{m.rate.toLocaleString("en-IN")}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add Product FAB */}
      <Link
        href="/products/new"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-8 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all z-20"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </Link>
    </div>
  )
}
