export const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-sm text-gray-600">データを読み込んでいます...</p>
  </div>
);
