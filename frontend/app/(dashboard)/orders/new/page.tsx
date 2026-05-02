"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus, Minus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const materials = [
  { sku: "MSAND", name: "M-Sand", unit: "Unit" },
  { sku: "PSAND", name: "P-Sand", unit: "Unit" },
  { sku: "AGG6", name: "Aggregate 6mm", unit: "Ton" },
  { sku: "AGG12", name: "Aggregate 12mm", unit: "Ton" },
  { sku: "AGG20", name: "Aggregate 20mm", unit: "Ton" },
  { sku: "AGG40", name: "Aggregate 40mm", unit: "Ton" },
  { sku: "JELLY", name: "Jelly", unit: "Ton" },
  { sku: "DUST", name: "Quarry Dust", unit: "Ton" },
]

const vehicles = [
  { id: "T6", label: "6-Wheel Tipper", cap: "~8 t" },
  { id: "T10", label: "10-Wheel Tipper", cap: "~16 t" },
  { id: "T12", label: "12-Wheel Tipper", cap: "~20 t" },
  { id: "L16", label: "16-Wheel Lorry", cap: "~25 t" },
]

const slots = ["07–10 AM", "10–01 PM", "01–04 PM", "04–07 PM"]

const steps = ["Items", "Site", "Vehicle", "Review"]

type OrderItem = { sku: string; name: string; unit: string; qty: number }

export default function NewOrderPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [items, setItems] = useState<OrderItem[]>([
    { sku: "AGG20", name: "Aggregate 20mm", unit: "Ton", qty: 16 },
  ])
  const [address, setAddress] = useState("")
  const [date, setDate] = useState("")
  const [slot, setSlot] = useState("07–10 AM")
  const [vehicle, setVehicle] = useState("T10")
  const [customer, setCustomer] = useState({ name: "", gstin: "", phone: "" })

  const addItem = () => setItems(prev => [...prev, { sku: "AGG20", name: "Aggregate 20mm", unit: "Ton", qty: 1 }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof OrderItem, val: string | number) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const totalTons = items.reduce((sum, i) => sum + (i.unit === "Ton" ? i.qty : 0), 0)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 md:px-8 md:pt-8 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => step === 0 ? router.back() : setStep(s => s - 1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-gray-900">New order</h1>
            <p className="text-xs text-gray-400">Draft saved</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium transition-colors",
                  i === step ? "text-blue-600" : i < step ? "text-green-600 cursor-pointer" : "text-gray-300"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  i === step ? "bg-blue-600 text-white" : i < step ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < steps.length - 1 && <div className={cn("flex-1 h-px w-6", i < step ? "bg-green-400" : "bg-gray-200")} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 py-4 md:px-8 md:py-6 space-y-4">

        {/* Step 0: Items */}
        {step === 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">What and how much?</p>
            {items.map((item, i) => (
              <Card key={i} className="border-gray-100 shadow-none">
                <CardContent className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <select
                      value={item.sku}
                      onChange={(e) => {
                        const m = materials.find(m => m.sku === e.target.value)!
                        updateItem(i, "sku", m.sku)
                        updateItem(i, "name", m.name)
                        updateItem(i, "unit", m.unit)
                      }}
                      className="text-sm font-semibold text-gray-900 bg-transparent border-0 outline-none cursor-pointer flex-1"
                    >
                      {materials.map(m => <option key={m.sku} value={m.sku}>{m.name}</option>)}
                    </select>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">per {item.unit}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateItem(i, "qty", Math.max(1, item.qty - 1))}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="text-sm font-bold text-gray-900 w-8 text-center">{item.qty}{item.unit === "Ton" ? "t" : "u"}</span>
                      <button
                        onClick={() => updateItem(i, "qty", item.qty + 1)}
                        className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <button
              onClick={addItem}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add another material
            </button>
          </div>
        )}

        {/* Step 1: Site */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700">Customer & delivery site</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer name</label>
                <Input value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
                  placeholder="Karthik Promoters Pvt Ltd" className="mt-1 h-10 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">GSTIN</label>
                  <Input value={customer.gstin} onChange={e => setCustomer(p => ({ ...p, gstin: e.target.value }))}
                    placeholder="33AABCK4218P1Z9" className="mt-1 h-10 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                  <Input value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98410 22183" className="mt-1 h-10 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery address</label>
                <Input value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Site address, area, pincode" className="mt-1 h-10 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 h-10 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Slot</label>
                  <div className="mt-1 grid grid-cols-2 gap-1.5">
                    {slots.map(s => (
                      <button key={s} onClick={() => setSlot(s)}
                        className={cn("text-[11px] py-1.5 rounded-lg border font-medium transition-colors", slot === s ? "bg-blue-600 text-white border-blue-600" : "text-gray-600 border-gray-200 hover:border-blue-300")}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Select vehicle</p>
            {vehicles.map(v => (
              <button key={v.id} onClick={() => setVehicle(v.id)} className="w-full">
                <Card className={cn("border-2 transition-colors", vehicle === v.id ? "border-blue-600 bg-blue-50" : "border-gray-100 hover:border-gray-200")}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs", vehicle === v.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600")}>
                        {v.id}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">{v.label}</p>
                        <p className="text-xs text-gray-400">Capacity {v.cap}</p>
                      </div>
                    </div>
                    {vehicle === v.id && <Check className="w-5 h-5 text-blue-600" />}
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700">Review order</p>
            <Card className="border-gray-100 shadow-none">
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items</p>
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold text-gray-600">{item.sku}</Badge>
                        <span className="text-sm text-gray-800">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.qty}{item.unit === "Ton" ? "t" : "u"}</span>
                    </div>
                  ))}
                </div>
                {address && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Delivery</p>
                    <p className="text-sm text-gray-800">{address}</p>
                    {date && <p className="text-xs text-gray-400 mt-0.5">{new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {slot}</p>}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Vehicle</p>
                  <p className="text-sm text-gray-800">{vehicles.find(v => v.id === vehicle)?.label}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-6 pt-3 bg-white border-t border-gray-100 md:px-8">
        <Button
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
          onClick={() => step < 3 ? setStep(s => s + 1) : router.push("/orders")}
        >
          {step < 3
            ? <span className="flex items-center gap-1.5">Continue <ChevronRight className="w-4 h-4" /></span>
            : <span>Place Order · {totalTons}T{date ? ` · ${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}</span>
          }
        </Button>
      </div>
    </div>
  )
}
