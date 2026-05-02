import Link from "next/link"
import { FileText, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const invoices = [
  { id: "SRBT-2841", customer: "Karthik Promoters Pvt Ltd", date: "01 May 2026", amount: "₹23,100", status: "Paid" },
  { id: "SRBT-2840", customer: "Vetri Builders", date: "01 May 2026", amount: "₹18,600", status: "Paid" },
  { id: "SRBT-2839", customer: "Self · Murugan R.", date: "01 May 2026", amount: "₹9,200", status: "Pending" },
  { id: "SRBT-2838", customer: "Karthik Promoters", date: "30 Apr 2026", amount: "₹36,500", status: "Overdue" },
]

const statusStyles: Record<string, string> = {
  Paid: "bg-green-50 text-green-700 border-green-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Overdue: "bg-red-50 text-red-700 border-red-200",
}

export default function InvoicesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-white px-4 pt-4 pb-3 md:px-8 md:pt-8 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900 md:text-2xl">Invoices</h1>
        <p className="text-xs text-gray-400 mt-0.5">{invoices.length} invoices</p>
      </div>

      <div className="px-4 py-4 md:px-8 md:py-6 space-y-2">
        {invoices.map((inv) => (
          <Link key={inv.id} href={`/invoices/${inv.id}`}>
            <Card className="border-gray-100 shadow-none hover:shadow-sm transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{inv.id}</p>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${statusStyles[inv.status]}`}>
                      {inv.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{inv.customer}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-400">{inv.date}</p>
                    <p className="text-sm font-bold text-gray-900">{inv.amount}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
