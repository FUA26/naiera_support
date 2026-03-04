export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 bg-white rounded-lg border border-gray-200 animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-80 bg-white rounded-lg border border-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
