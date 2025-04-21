
export function MapLoading() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-locale-500 border-r-transparent"></div>
      <p className="ml-3 text-gray-600">Loading map...</p>
    </div>
  );
}
