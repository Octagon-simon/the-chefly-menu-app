import { LoadingSpinner } from "@/components/loading-spinner";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="text-center">
        <LoadingSpinner />
        <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}
