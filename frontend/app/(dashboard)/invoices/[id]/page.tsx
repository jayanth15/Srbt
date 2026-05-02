import Link from "next/link"
import { ChevronLeft, Download, Share2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Static demo data — replace with API fetch
const invoiceData = {
  id: "SRBT-2841",
  status: "Paid",
  gstin_from: "33ABCDE1234F1Z5",
  state: "33-Tamil Nadu",
  date: "01 May 2026",
  po: "PO-2026-0418",
  dc: "DC-03319",
  customer: {
    name: "Karthik Promoters Pvt Ltd",
    address: "14, OMR Phase II, Sholinganallur, Chennai 600119",
    gstin: "33AABCK4218P1Z9",
  },
  vehicle: { number: "TN-22 BC 4471", driver: "Selvaraj M." },
  items: [
    { name: "Aggregate 20mm", unitLabel: "per Ton", hsn: "2517", qty: 16, rate: 950, amount: 15200 },
    { name: "M-Sand", unitLabel: "per Unit", hsn: "2517", qty: 1, rate: 6800, amount: 6800 },
  ],
  subtotal: 22000,
  cgst: 550,
  sgst: 550,
  total: 23100,
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const inv = invoiceData // In production: fetch by params.id

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 md:px-8 md:pt-8 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">Invoice</h1>
          </div>
          <Badge variant="outline" className={`ml-auto text-xs px-2 py-0.5 ${inv.status === "Paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
            {inv.status}
          </Badge>
        </div>
      </div>

      {/* Invoice body */}
      <div className="flex-1 px-4 py-5 md:px-8 md:py-6 space-y-5">
        {/* From */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">R</div>
            <div>
              <p className="text-sm font-bold text-gray-900">Sri Raghavendra</p>
              <p className="text-[10px] font-bold text-blue-500 tracking-widest uppercase">Blue Metals</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tax Invoice</p>
            <p className="text-base font-bold text-gray-900">{inv.id}</p>
          </div>
        </div>

        <p className="text-[11px] text-gray-400">GSTIN {inv.gstin_from} &nbsp;·&nbsp; State: {inv.state}</p>

        <Separator />

        {/* Bill To & Vehicle */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Bill To</p>
            <p className="text-sm font-semibold text-gray-900">{inv.customer.name}</p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5">{inv.customer.address}</p>
            <p className="text-[11px] text-gray-400 mt-1">{inv.customer.gstin}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Vehicle</p>
            <p className="text-sm font-semibold text-gray-900">{inv.vehicle.number}</p>
            <p className="text-xs text-gray-500">Driver: {inv.vehicle.driver}</p>
            <p className="text-[11px] text-gray-400 mt-1">{inv.dc} · {inv.date}</p>
          </div>
        </div>

        <Separator />

        {/* Invoice meta */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Invoice #", value: inv.id },
            { label: "Date", value: inv.date },
            { label: "PO #", value: inv.po },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
              <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Line items */}
        <div>
          <div className="grid grid-cols-12 gap-1 pb-2 border-b border-gray-100">
            {["Item", "HSN", "Qty", "Rate", "Amt"].map((h, i) => (
              <p key={h} className={`text-[10px] font-semibold text-gray-400 uppercase tracking-wide col-span-${[4, 2, 2, 2, 2][i]}`}>{h}</p>
            ))}
          </div>
          {inv.items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-1 py-3 border-b border-gray-50 items-start">
              <div className="col-span-4">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-[11px] text-gray-400">{item.unitLabel}</p>
              </div>
              <p className="col-span-2 text-xs text-gray-500 pt-0.5">{item.hsn}</p>
              <p className="col-span-2 text-xs font-medium text-gray-800 pt-0.5">{item.qty}</p>
              <p className="col-span-2 text-xs font-medium text-gray-800 pt-0.5">{item.rate.toLocaleString()}</p>
              <p className="col-span-2 text-xs font-semibold text-gray-900 pt-0.5 text-right">{item.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-2">
          {[
            { label: "Subtotal", value: `₹${inv.subtotal.toLocaleString()}`, bold: false },
            { label: "CGST 2.5%", value: `₹${inv.cgst.toLocaleString()}`, bold: false },
            { label: "SGST 2.5%", value: `₹${inv.sgst.toLocaleString()}`, bold: false },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm text-gray-500">
              <span>{label}</span><span>{value}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-900">TOTAL</span>
            <span className="text-xl font-extrabold text-gray-900">₹{inv.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 py-3 px-4 bg-green-50 rounded-xl border border-green-100">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-semibold text-green-700">Paid</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-6 pt-3 bg-white border-t border-gray-100 grid grid-cols-3 gap-2 md:px-8">
        <Button variant="outline" className="flex-col h-14 gap-1 text-xs font-medium text-gray-700">
          <Download className="w-4 h-4" />Download
        </Button>
        <Button variant="outline" className="flex-col h-14 gap-1 text-xs font-medium text-green-600 border-green-200">
          <MessageCircle className="w-4 h-4" />WhatsApp
        </Button>
        <Button variant="outline" className="flex-col h-14 gap-1 text-xs font-medium text-gray-700">
          <Share2 className="w-4 h-4" />Share
        </Button>
      </div>
    </div>
  )
}
