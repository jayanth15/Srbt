export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order #{params.id}</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-gray-400 text-sm">Order details will appear here.</p>
      </div>
    </div>
  )
}
