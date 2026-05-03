"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AppHeader } from "@/components/shared/AppHeader"
import { cn } from "@/lib/utils"

export const materials = [
  { sku: "MSAND", name: "M-Sand", desc: "Manufactured Sand", unit: "Unit (100 cft)", hsn: "2517", category: "Sand", stock: "IN STOCK", stockLevel: "high", rate: 6800 },
  { sku: "PSAND", name: "P-Sand", desc: "Plastering Sand", unit: "Unit (100 cft)", hsn: "2517", category: "Sand", stock: "IN STOCK", stockLevel: "high", rate: 5500 },
  { sku: "AGG6",  name: "Aggregate 6mm", desc: "Chips / Grit", unit: "Ton", hsn: "2517", category: "Aggregates", stock: "IN STOCK", stockLevel: "high", rate: 900 },
  { sku: "AGG12", name: "Aggregate 12mm", desc: "Blue Metal", unit: "Ton", hsn: "2517", category: "Aggregates", stock: "IN STOCK", stockLevel: "high", rate: 920 },
  { sku: "AGG20", name: "Aggregate 20mm", desc: "Blue Metal", unit: "Ton", hsn: "2517", category: "Aggregates", stock: "IN STOCK", stockLevel: "high", rate: 950 },
  { sku: "AGG40", name: "Aggregate 40mm", desc: "Blue Metal", unit: "Ton", hsn: "2517", category: "Aggregates", stock: "LOW STOCK", stockLevel: "low", rate: 930 },
  { sku: "JELLY", name: "Jelly", desc: "20mm well-graded", unit: "Ton", hsn: "2517", category: "Aggregates", stock: "IN STOCK", stockLevel: "high", rate: 880 },
  { sku: "DUST",  name: "Quarry Dust", desc: "Stone dust", unit: "Ton", hsn: "2517", category: "Dust", stock: "IN STOCK", stockLevel: "high", rate: 450 },
]

const swatchGradient: Record<string, string> = {
  MSAND: "from-amber-100 to-amber-50",
  PSAND: "from-yellow-100 to-yellow-50",
  AGG6:  "from-slate-200 to-slate-100",
  AGG12: "from-slate-300 to-slate-100",
  AGG20: "from-blue-200 to-blue-100",
  AGG40: "from-blue-300 to-blue-100",
  JELLY: "from-sky-200 to-sky-100",
  DUST:  "from-stone-200 to-stone-100",
}

export default function CatalogPage() {
  return (
    <div className="flex flex-col min-h-full">
      <AppHeader />
      {/* Header */}
      <div className="bg-background px-4 pt-3 pb-3 md:px-8 md:pt-8 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold md:text-2xl">Materials</h1>
          <Badge variant="outline" className="text-xs text-muted-foreground">{materials.length} items</Badge>
        </div>
      </div>

      <div className="p-4 md:px-8 md:py-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {materials.map((m) => (
            <Link key={m.sku} href={`/catalog/${m.sku}`}>
              <Card size="sm" className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer p-0 gap-0">
                <div className={`relative h-24 bg-gradient-to-br ${swatchGradient[m.sku] ?? "from-muted to-muted/50"} flex items-end p-2`}>
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: "repeating-linear-gradient(45deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%)", backgroundSize: "8px 8px" }}
                  />
                  <Badge variant="outline" className="relative z-10 text-[10px] font-bold bg-background/80 border-0 px-1.5 py-0">
                    {m.sku}
                  </Badge>
                </div>
                <CardContent className="pt-3 pb-3">
                  <p className="text-sm font-semibold leading-tight">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{m.desc}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-muted-foreground">per {m.unit}</p>
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-semibold",
                      m.stockLevel === "low" ? "text-amber-600" : "text-green-600"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", m.stockLevel === "low" ? "bg-amber-500" : "bg-green-500")} />
                      {m.stock}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Add Product FAB */}
      <Link
        href="/catalog/new"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-8 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all z-20"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </Link>
    </div>
  )
}
