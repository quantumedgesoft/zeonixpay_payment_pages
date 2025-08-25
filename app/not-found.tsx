import { XCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
        {/* Icon */}
        <XCircle className="mx-auto h-16 w-16 text-red-600" />

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800">Page Not Found</h1>

        {/* Message */}
        <p className="text-gray-600">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>
      </div>
    </main>
  );
}
