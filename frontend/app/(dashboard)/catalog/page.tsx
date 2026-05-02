"use client"

import { useState } from "react"
import { Search, Plus, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const categories = ["All", "Sand", "Aggregates", "Dust"]

const materials = [
  { sku: "MSAND", name: "M-Sand", desc: "Manufactured Sand", unit: "Unit (100 cft)", hsn: "2517", category: "Sand", stock: "IN STOCK", stockLevel: "high" },
  { sku: "PSAND", name: "P-Sand", desc: "Plastering Sand", unit: "Unit (100 cft)", hsn: "2517", category: "Sand", stock: "IN STOCK", stockLevel: "high" },
  { sku: "AGG6", name: "Aggregate 6mm", desc: "Chips / Grit", unit: "Ton", hsn: "2517", category: "Aggregates", stock: "IN STOCK", stockLevel: "high" },
  { sku: "AGG12", name: "Aggregate 12mm", desc: "Blue Metal", unit: "Ton", hsn: "2517", category: "Aggregates", stock: "IN STOCK", stockLevel: "high" },
  { sku: "AGG20", name: "Aggregate 20mm", desc: "Blue Metal", unit: "Ton", hsn: "2517", category: "Aggregates", stock: "IN STOCK", stockLevel: "high" },
  { sku: "AGG40", name: "Aggregate 40mm", desc: "Blue Metal", unit: "Ton", hsn: "2517", category: "Aggregates", stock: "LOW STOCK", stockLevel: "low" },
  { sku: "JELLY", name: "Jelly", desc: "20mm well-graded", unit: "Ton", hsn: "2517", category: "Aggregates", stock: "IN STOCK", stockLevel: "high" },
  { sku: "DUST", name: "Quarry Dust", desc: "Stone dust", unit: "Ton", hsn: "2517", category: "Dust", stock: "IN STOCK", stockLevel: "high" },
]

// Diagonal pattern background for material cards
const skuColors: Record<string, string> = {
  MSAND: "from-amber-100 to-amber-50",
  PSAND: "from-yellow-100 to-yellow-50",
  AGG6: "from-slate-200 to-slate-100",
  AGG12: "from-slate-300 to-slate-100",
  AGG20: "from-blue-200 to-blue-100",
  AGG40: "from-blue-300 to-blue-100",
  JELLY: "from-sky-200 to-sky-100",
  DUST: "from-stone-200 to-stone-100",
}

export default function CatalogPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")

  const filtered = materials.filter((m) => {
    const matchCat = category === "All" || m.category === category
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.sku.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile sticky top */}
      <div className="bg-white px-4 pt-4 pb-3 md:px-8 md:pt-8 space-y-3 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 md:text-2xl">Materials</h1>
          <Badge variant="outline" className="text-xs text-gray-500">{materials.length} items</Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search M-Sand, 20mm, jelly…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-100 h-9 text-sm"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {categories.map((cat) => {
            const count = cat === "All" ? materials.length : materials.filter(m => m.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors",
                  category === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat} <span className="opacity-70">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 md:px-8 md:py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No materials found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((m) => (
              <Card key={m.sku} className="border-gray-100 shadow-none overflow-hidden hover:shadow-sm transition-shadow cursor-pointer group">
                {/* Color swatch / pattern */}
                <div className={`relative h-24 bg-gradient-to-br ${skuColors[m.sku] ?? "from-gray-100 to-gray-50"} flex items-end p-2`}>
                  {/* Diagonal stripe pattern */}
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)", backgroundSize: "8px 8px" }} />
                  <Badge variant="outline" className="relative z-10 text-[10px] font-bold bg-white/80 border-0 text-gray-700 px-1.5 py-0">
                    {m.sku}
                  </Badge>
                </div>

                <CardContent className="p-3">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{m.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{m.desc}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-gray-500">per {m.unit}</p>
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
