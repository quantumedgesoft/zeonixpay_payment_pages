"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export type BkashAgentFlowProps = {
  merchantName: string;
  merchantInvoiceId: string;
  merchantLogoSrc?: string;
  receiverMsisdn: string;
  amount: number; // BDT
  onClose: () => void;
  onBack?: () => void;
  onVerifyTrx?: (trxId: string) => Promise<void> | void;
  paymentMethod: string; // e.g. "bkash-agent" | "bkash-personal" | ...
};

export default function BkashAgentFlow({
  merchantName,
  merchantInvoiceId,
  merchantLogoSrc = "/geteway/bkash.svg",
  receiverMsisdn,
  amount,
  onBack,
  onVerifyTrx,
  paymentMethod,
}: BkashAgentFlowProps) {
  const [trxId, setTrxId] = useState("");
  const dialCode = paymentMethod.includes("bkash")
    ? "*247#"
    : paymentMethod.includes("nagad")
    ? "*167#"
    : "*322#";
  const method = paymentMethod.includes("bkash")
    ? "bKash"
    : paymentMethod.includes("nagad")
    ? "Nagad"
    : "Rocket";

    const providerColor =
  paymentMethod.includes("bkash")
    ? "rgba(207, 39, 113, 0.90)"
    : paymentMethod.includes("nagad")
    ? "rgba(201, 0, 8, 0.90)"
    : "rgba(137, 40, 143, 0.90)";


  const actionText = paymentMethod.includes("personal") ? "Send Money" : "Cash Out";

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(receiverMsisdn);
      toast.success("Copied");
    } catch {}
  };

  const verify = async () => {
    if (!trxId.trim()) return;
    if (onVerifyTrx) await onVerifyTrx(trxId.trim());
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden mx-auto">
      {/* Header row with Back button (no Home icon) */}
      <div className="flex  items-center justify-between px-5 py-4 border-b">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          {/* back chevron */}
          <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
          Back to payment
        </button>

        <div className="rounded-xl border border-slate-200 p-2 grid place-items-center">
          <Image src={merchantLogoSrc} alt="bKash" width={50} height={50} className="object-contain" />
        </div>
      </div>

      {/* Merchant row */}
      <div className="flex items-center gap-4 px-6 pt-5">
        <div className="flex-1 rounded-xl border border-slate-200 p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-100 text-violet-700 font-semibold">
              ৳
            </div>
            <div>
              <div className="font-medium text-slate-800">{merchantName}</div>
              <div className="text-xs text-slate-500">
                Invoice ID : <span className="font-mono">{merchantInvoiceId.slice(0, 10)}</span>
              </div>
            </div>
          </div>
        </div>
          <span className="font-semibold bg-white/20 rounded px-2 py-0.5 tel">৳{amount.toFixed(2)}</span>
      </div>

      {/* Instruction card */}
      <div className={`mx-6 my-6 rounded-xl bg-rose-600/90 text-white`} style={{ backgroundColor: providerColor }}>
        <div className="px-6 pt-5 pb-2 text-center">
          <div className="text-sm/5 font-semibold tracking-wide">ট্রানজেকশন আইডি দিন</div>
        </div>

        <div className="px-6 pb-4">
          <input
            value={trxId}
            onChange={(e) => setTrxId(e.target.value)}
            placeholder="ট্রানজেকশন আইডি দিন"
            className="w-full rounded-lg bg-white/95 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none ring-2 ring-transparent focus:ring-white"
          />
        </div>

        <div className="px-6 pb-6 space-y-3 text-[13px]">
          <Step>
            {dialCode} ডায়াল করে আপনার {method} মোবাইল মেনুতে যান অথবা অ্যাপ চালু করুন
          </Step>
          <Divider />
          <Step>
            <b>{actionText} এ ক্লিক করুন</b>
          </Step>
          <Divider />
          <Step className="flex items-center gap-2 flex-wrap">
            উত্তোলক নম্বর হিসেবে এই নম্বরটি লিখুন{" "}
            <span className="font-bold bg-white/20 rounded px-2 py-0.5">{receiverMsisdn}</span>
            <button
              onClick={copyNumber}
              className="inline-flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-rose-700 font-medium hover:bg-white"
            >
              <span className="text-[12px]">Copy</span>
            </button>
          </Step>
          <Divider />
          <Step>
            টাকার পরিমাণ{" "}
            <span className="font-semibold bg-white/20 rounded px-2 py-0.5">৳{amount.toFixed(2)}</span>
          </Step>
          <Divider />
          <Step>লেনদেন সফল হলে একটি নিশ্চিতকরণ বার্তা পাবেন।</Step>
          <Divider />
          <Step>
            বার্তা পাওয়ার পর আপনার <b>Transaction ID</b> দিন এবং <b>VERIFY</b> চাপুন।
          </Step>
        </div>
      </div>

      {/* Verify / Close */}
      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={verify}
          disabled={!trxId.trim()}
          style={{ backgroundColor: providerColor }}
          className="flex-1 rounded-xl  px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          VERIFY
        </button>
      </div>
    </div>
  );
}

/* helpers */
function Step({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-white ${className}`}>{children}</p>;
}
function Divider() {
  return <div className="h-px w-full bg-white/20 my-2" />;
}
