export default function ReportsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["Monthly Sales", "Delivery Summary", "Vehicle Utilization", "Customer Ledger"].map((report) => (
          <div key={report} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{report}</span>
            <button className="text-xs text-blue-700 font-semibold hover:underline">Download</button>
          </div>
        ))}
      </div>
    </div>
  )
}
