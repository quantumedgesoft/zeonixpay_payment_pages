"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import PaymentSuccessSkeleton from "@/app/components/PaymentSuccessSkeleton";

// Define TypeScript interface for payment data
interface PaymentData {
  paymentID: string | null;
  trxID: string | null;
  transactionStatus: string | null;
  amount: string | null;
  currency: string | null;
  paymentExecuteTime: string | null;
  merchantInvoiceNumber: string | null;
  payerReference: string | null;
  customerMsisdn: string | null;
}

const SuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use the defined type for paymentData
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    const data = {
      paymentID: searchParams.get("paymentID"),
      trxID: searchParams.get("trxID"),
      transactionStatus: searchParams.get("transactionStatus"),
      amount: searchParams.get("amount"),
      currency: searchParams.get("currency"),
      paymentExecuteTime: searchParams.get("paymentExecuteTime"),
      merchantInvoiceNumber: searchParams.get("merchantInvoiceNumber"),
      payerReference: searchParams.get("payerReference"),
      customerMsisdn: searchParams.get("customerMsisdn"),
    };

    setPaymentData(data);
  }, [searchParams]);

    if (!searchParams) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-rose-600">Invalid Invoice</h1>
          <p className="text-slate-600">We couldn’t find that invoice ID.</p>
        </div>
      </div>
    );
  }


  const handleRedirect = () => {
    router.push("/"); // Change this to the path where you want to redirect
  };

  if (!paymentData) {
    return <PaymentSuccessSkeleton/>;
  }

  // Ensure that paymentExecuteTime is not null before creating a Date object
  const paymentExecuteTime = paymentData.paymentExecuteTime
    ? new Date(paymentData.paymentExecuteTime)
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-3xl bg-white p-12 rounded-3xl shadow-3xl border border-gray-100 space-y-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-extrabold text-teal-700">🎉 Payment Successful!</h2>
          <p className="text-xl text-gray-700 mt-3">
            Your transaction has been successfully completed.
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mt-10 text-center"
        >
          <Image
            src="/success-icon-unscreen.gif" // Replace with your custom success icon or use a built-in one
            alt="Success"
            width={250}
            height={250}
            className="mx-auto mb-6 bg-transparent"
          />
        </motion.div>

        <div className="space-y-8">
          {[
            { label: "Payment ID", value: paymentData.paymentID },
            { label: "Transaction ID", value: paymentData.trxID },
            { label: "Amount", value: `${paymentData.amount} ${paymentData.currency}` },
            { label: "Transaction Status", value: paymentData.transactionStatus, color: "text-teal-600" },
            { label: "Payment Time", value: paymentExecuteTime ? paymentExecuteTime.toLocaleString() : "N/A" },
          ].map(({ label, value, color = "text-gray-800" }, index) => (
            <div key={index} className="flex justify-between gap-8">
              <p className="text-md font-semibold text-gray-600">{label}:</p>
              <p className={`text-lg font-medium ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={handleRedirect}
            className="px-10 py-4 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold rounded-full hover:bg-gradient-to-r hover:from-teal-400 hover:to-indigo-500 transition duration-300 ease-in-out shadow-2xl transform hover:scale-105"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
