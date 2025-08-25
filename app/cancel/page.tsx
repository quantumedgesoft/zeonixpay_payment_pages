"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Payment Cancelled
        </h1>

        {/* Message */}
        <p className="mt-3 text-sm text-gray-600">
          Your payment was not completed. Don’t worry, you can try again or
          return to your dashboard.
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/payment"
            className="rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 font-semibold hover:bg-gray-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
