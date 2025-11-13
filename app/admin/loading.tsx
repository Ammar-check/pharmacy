export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-8 w-60 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="h-24 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />
          <div className="h-24 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />
          <div className="h-24 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}


