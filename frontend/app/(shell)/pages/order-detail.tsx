"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Package, MapPin, Truck, CheckCircle2, Clock, XCircle, CalendarDays, FileText, Loader2, Edit2, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

const statusStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  pending:    { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", icon: <Clock className="w-3 h-3" /> },
  confirmed:  { bg: "bg-indigo-50 border-indigo-100", text: "text-indigo-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  dispatched: { bg: "bg-blue-50 border-blue-100",   text: "text-blue-600",  icon: <Truck className="w-3 h-3" /> },
  delivered:  { bg: "bg-green-50 border-green-100", text: "text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled:  { bg: "bg-red-50 border-red-100",     text: "text-red-600",   icon: <XCircle className="w-3 h-3" /> },
}
const statusLabel: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", dispatched: "In transit",
  delivered: "Delivered", cancelled: "Cancelled",
}
const itemStatusList = ["pending","in_transit","delivered","cancelled"]

interface OrderItem {
  id: number; material_name_snapshot: string; qty: number; unit: string; rate: number
  status: string; dc_number?: string | null; amount?: number
}
interface Order {
  id: number; order_number: string; customer_name: string; customer_phone?: string
  company_name?: string; delivery_address: string; delivery_date?: string
  delivery_slot?: string; po_number?: string; status: string; total_amount?: number
  created_at: string; items: OrderItem[]; has_invoice?: boolean
}

function StatusIcon({ status }: { status: string }) {
  return statusStyles[status]?.icon ?? <Clock className="w-3 h-3" />
}

function OrderItemRow({
  item, orderId, onUpdated,
}: { item: OrderItem; orderId: number; onUpdated: () => void }) {
  const [editing, setEditing]   = useState(false)
  const [newStatus, setNewStatus] = useState(item.status)
  const [dcNumber, setDcNumber] = useState(item.dc_number ?? "")
  const [saving, setSaving]     = useState(false)

  const st = statusStyles[item.status] ?? statusStyles.pending

  const save = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      await api.patch(`/api/v1/orders/${orderId}/items/${item.id}`, {
        status: newStatus, dc_number: dcNumber || null,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setEditing(false)
      onUpdated()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className={cn("rounded-xl border p-3", st.bg)}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Package className={cn("w-4 h-4 shrink-0", st.text)} />
          <p className="text-sm font-medium truncate">{item.material_name_snapshot}</p>
        </div>
        <button onClick={() => setEditing(e => !e)} className="text-muted-foreground hover:text-foreground shrink-0">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground ml-6">{item.qty} {item.unit} × ₹{item.rate}/u = ₹{((item.amount ?? item.qty * item.rate)).toLocaleString("en-IN")}</p>
      <div className="flex items-center gap-1.5 ml-6 mt-1">
        <StatusIcon status={item.status} />
        <span className={cn("text-xs font-medium", st.text)}>{statusLabel[item.status] ?? item.status}</span>
        {item.dc_number && <span className="text-xs text-muted-foreground">· DC {item.dc_number}</span>}
      </div>

      {editing && (
        <div className="mt-3 ml-6 flex flex-col gap-2">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {itemStatusList.map(s => (
                <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(newStatus === "delivered" || newStatus === "in_transit") && (
            <Input placeholder="DC number" value={dcNumber} onChange={e => setDcNumber(e.target.value)} className="h-8 text-xs" />
          )}
          <Button size="sm" onClick={save} disabled={saving} className="h-8 text-xs">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-3.5 h-3.5 mr-1" />Save</>}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function OrderDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const [order, setOrder]         = useState<Order | null>(null)
  const [loading, setLoading]     = useState(true)
  const [invoiceDialog, setInvoiceDialog] = useState(false)
  const [gstEnabled, setGstEnabled]       = useState(true)
  const [creatingInvoice, setCreatingInvoice] = useState(false)

  const fetchOrder = () => {
    setLoading(true)
    api.get<Order>(`/api/v1/orders/${id}`)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrder() }, [id])

  const createInvoice = async () => {
    setCreatingInvoice(true)
    try {
      const token = localStorage.getItem("token")
      const inv = await api.post<{ id: number }>("/api/v1/invoices/",
        { order_id: Number(id), is_gst_applicable: gstEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setInvoiceDialog(false)
      router.push(`/invoices/${inv.id}`)
    } catch (e) { console.error(e) }
    finally { setCreatingInvoice(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  )
  if (!order) return (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <p className="text-sm text-muted-foreground">Order not found</p>
      <Link href="/orders" className="text-xs underline">← Back</Link>
    </div>
  )

  const st     = statusStyles[order.status] ?? statusStyles.pending
  const allDelivered = order.items.length > 0 && order.items.every(i => i.status === "delivered")
  const canInvoice   = allDelivered && !order.has_invoice

  return (
    <div className="flex flex-col pb-28">
      {/* Top bar */}
      <div className="sticky top-0 bg-background z-10 flex items-center justify-between px-4 md:px-6 h-12 border-b">
        <Link href="/orders" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /><span>Orders</span>
        </Link>
        <p className="text-sm font-semibold">{order.order_number}</p>
        <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium", st.bg, st.text)}>
          <StatusIcon status={order.status} />
          <span>{statusLabel[order.status] ?? order.status}</span>
        </div>
      </div>

      <div className="px-4 py-4 md:px-6 flex flex-col gap-4">
        {/* Customer info */}
        <Card>
          <CardContent className="py-3">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">CUSTOMER</p>
            <p className="text-sm font-semibold">{order.company_name || order.customer_name}</p>
            {order.customer_phone && <p className="text-xs text-muted-foreground">{order.customer_phone}</p>}
            <Separator className="my-2" />
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">{order.delivery_address || "—"}</p>
            </div>
            {(order.delivery_date || order.delivery_slot) && (
              <div className="flex items-center gap-1.5 mt-1">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {[order.delivery_date, order.delivery_slot].filter(Boolean).join(" · ")}
                </p>
              </div>
            )}
            {order.po_number && (
              <p className="text-xs text-muted-foreground mt-1">PO: {order.po_number}</p>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">ORDER ITEMS ({order.items.length})</p>
          {order.items.map(item => (
            <OrderItemRow key={item.id} item={item} orderId={order.id} onUpdated={fetchOrder} />
          ))}
        </div>

        {/* Total */}
        {order.total_amount != null && (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/60">
            <p className="text-sm font-medium">Order total</p>
            <p className="text-base font-bold">₹{order.total_amount.toLocaleString("en-IN")}</p>
          </div>
        )}

        {/* Invoice CTA */}
        {canInvoice && (
          <Button onClick={() => setInvoiceDialog(true)} className="w-full gap-2">
            <FileText className="w-4 h-4" /> Create Invoice
          </Button>
        )}
        {order.has_invoice && (
          <p className="text-center text-xs text-muted-foreground">Invoice already created for this order.</p>
        )}
        {!allDelivered && !order.has_invoice && order.items.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">Mark all items as delivered to create an invoice.</p>
        )}
      </div>

      {/* Invoice dialog */}
      <Dialog open={invoiceDialog} onOpenChange={setInvoiceDialog}>
        <DialogContent className="max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <p className="text-sm text-muted-foreground">Choose GST settings for this invoice.</p>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border bg-muted/30">
              <input
                type="checkbox" checked={gstEnabled}
                onChange={e => setGstEnabled(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <p className="text-sm font-medium">Apply GST (9% CGST + 9% SGST)</p>
                <p className="text-xs text-muted-foreground">18% GST will be added to the subtotal</p>
              </div>
            </label>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setInvoiceDialog(false)}>Cancel</Button>
            <Button onClick={createInvoice} disabled={creatingInvoice}>
              {creatingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
