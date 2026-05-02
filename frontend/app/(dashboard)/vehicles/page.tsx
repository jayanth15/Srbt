export default function VehiclesPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicles</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Vehicle No.", "Type", "Driver", "Status", "Last Trip"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                No vehicles registered
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
