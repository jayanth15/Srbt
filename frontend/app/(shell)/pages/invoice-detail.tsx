"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, CheckCircle2, Clock, Printer, Loader2, ReceiptText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

interface InvoiceItem {
  id: number; description: string; qty: number; unit: string; rate: number
  dc_number?: string | null; amount: number
}
interface Invoice {
  id: number; invoice_number: string; order_id: number; order_number?: string
  company_name?: string; company_gst?: string; company_address?: string
  customer_name?: string; is_gst_applicable: boolean
  subtotal: number; cgst_amount: number; sgst_amount: number; total_amount: number
  status: string; created_at: string; paid_at?: string | null
  items: InvoiceItem[]
}

export default function InvoiceDetailPage({ id }: { id: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [markingPaid, setMarkingPaid] = useState(false)

  const fetchInvoice = () => {
    setLoading(true)
    api.get<Invoice>(`/api/v1/invoices/${id}`)
      .then(setInvoice).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchInvoice() }, [id])

  const markPaid = async () => {
    setMarkingPaid(true)
    try {
      const token = localStorage.getItem("token")
      await api.patch(`/api/v1/invoices/${id}/paid`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchInvoice()
    } catch (e) { console.error(e) }
    finally { setMarkingPaid(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  )
  if (!invoice) return (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <p className="text-sm text-muted-foreground">Invoice not found</p>
      <Link href="/invoices" className="text-xs underline">← Back</Link>
    </div>
  )

  const isPaid   = invoice.status === "paid"
  const created  = new Date(invoice.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })
  const paidDate = invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }) : null

  return (
    <div className="flex flex-col pb-28">
      {/* Top bar */}
      <div className="sticky top-0 bg-background z-10 flex items-center justify-between px-4 md:px-6 h-12 border-b">
        <Link href="/invoices" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /><span>Invoices</span>
        </Link>
        <p className="text-sm font-semibold truncate max-w-[140px]">{invoice.invoice_number}</p>
        <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5",
          isPaid ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100")}>
          {isPaid ? <><CheckCircle2 className="w-3 h-3 mr-1 inline" />Paid</> : <><Clock className="w-3 h-3 mr-1 inline" />Pending</>}
        </Badge>
      </div>

      <div className="px-4 py-4 md:px-6 flex flex-col gap-4">
        {/* Invoice header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <ReceiptText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-base font-bold">{invoice.invoice_number}</p>
              <p className="text-xs text-muted-foreground">{created}</p>
            </div>
          </div>
          {isPaid && paidDate && (
            <p className="text-xs text-green-600 font-medium">Paid {paidDate}</p>
          )}
        </div>

        {/* Bill-to */}
        <Card>
          <CardContent className="py-3">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">BILL TO</p>
            <p className="text-sm font-semibold">{invoice.company_name || invoice.customer_name || "—"}</p>
            {invoice.company_gst && <p className="text-xs text-muted-foreground">GST: {invoice.company_gst}</p>}
            {invoice.company_address && <p className="text-xs text-muted-foreground">{invoice.company_address}</p>}
            {invoice.order_number && (
              <>
                <Separator className="my-2" />
                <Link href={`/orders/${invoice.order_id}`} className="text-xs text-primary underline">
                  Order {invoice.order_number}
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Items table */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">LINE ITEMS</p>
          <div className="rounded-xl border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-3 py-2 bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Description</span><span className="text-right">Qty</span><span className="text-right">Rate</span><span className="text-right">Amount</span>
            </div>
            {invoice.items.map((item, i) => (
              <div key={item.id} className={cn(
                "grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-3 py-2.5 text-sm border-t",
                i % 2 === 1 ? "bg-muted/20" : ""
              )}>
                <div>
                  <p className="font-medium text-xs">{item.description}</p>
                  {item.dc_number && <p className="text-[10px] text-muted-foreground mt-0.5">DC: {item.dc_number}</p>}
                </div>
                <span className="text-xs text-right text-muted-foreground self-start">{item.qty} {item.unit}</span>
                <span className="text-xs text-right text-muted-foreground self-start">₹{item.rate}</span>
                <span className="text-xs text-right font-medium self-start">₹{item.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex flex-col gap-1 px-3 py-3 rounded-xl border bg-muted/30">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{invoice.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {invoice.is_gst_applicable && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CGST (9%)</span>
                <span>₹{invoice.cgst_amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SGST (9%)</span>
                <span>₹{invoice.sgst_amount.toLocaleString("en-IN")}</span>
              </div>
            </>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>₹{invoice.total_amount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Mark as Paid */}
        {!isPaid && (
          <Button onClick={markPaid} disabled={markingPaid} size="lg" className="w-full gap-2">
            {markingPaid ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Mark as Paid</>}
          </Button>
        )}

        {/* Print / share placeholder */}
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 w-full">
          <Printer className="w-4 h-4" /> Print Invoice
        </Button>
      </div>
    </div>
  )
}
