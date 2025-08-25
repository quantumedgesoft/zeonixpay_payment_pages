"use client";

import { motion } from "framer-motion";

export default function PaymentSuccessSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-3xl bg-white p-12 rounded-3xl shadow-3xl border border-gray-100 space-y-12 animate-pulse">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="mx-auto h-6 w-48 bg-gray-200 rounded-md"></div>
          <div className="mx-auto h-4 w-64 bg-gray-200 rounded-md"></div>
        </motion.div>

        {/* Icon placeholder */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mt-10 flex justify-center"
        >
          <div className="h-40 w-40 bg-gray-200 rounded-full"></div>
        </motion.div>

        {/* Payment details placeholders */}
        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between gap-8">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Button placeholder */}
        <div className="mt-12 text-center">
          <div className="h-12 w-48 mx-auto bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
