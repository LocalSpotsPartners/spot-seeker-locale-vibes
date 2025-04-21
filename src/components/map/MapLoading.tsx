
export function MapLoading() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-100 flex-col">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-locale-500 border-r-transparent mb-2"></div>
      <p className="text-gray-600 font-medium">Loading map...</p>
      <p className="text-gray-500 text-sm mt-1">Fetching Mapbox token and initializing...</p>
    </div>
  );
}
