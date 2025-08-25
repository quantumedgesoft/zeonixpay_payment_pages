"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import BkashAgentFlow from "../components/BkashAgentFlow";

/** --------- Types --------- */
interface InvoiceData {
  invoice: { amount: number };
  mechant_info: { brand_name: string; brand_logo: string };
  payment_methods: string[];
}

export type GatewayKey =
  | "bkash-merchant"
  | "bkash-personal"
  | "bkash-agent"
  | "nagad-merchant"
  | "nagad-personal"
  | "nagad-agent"
  | "rocket-merchant"
  | "rocket-personal"
  | "rocket-agent";

/** --------- Page --------- */
export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<GatewayKey | null>(null);
  const [showInlineFlow, setShowInlineFlow] = useState(false);
  const [validInvoice, setValidInvoice] = useState(true);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const searchParams = useSearchParams();
  const invoice_payment_id = searchParams.get("invoice_payment_id");
console.log(invoice_payment_id);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const res = await fetch(
          `${process.env.BASE_URL}/get-payment/?invoice_payment_id=${invoice_payment_id}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (res.ok && data.status) setInvoiceData(data);
        else setValidInvoice(false);
      } catch (e) {
        console.error(e);
        setValidInvoice(false);
      }
    };
    if (invoice_payment_id) fetchInvoiceData();
  }, [invoice_payment_id]);

  const invoice = invoiceData?.invoice;
  const mechant_info = invoiceData?.mechant_info;

  // Fallbacks
  const amount = invoice?.amount ?? 1250;
  const currency = "BDT";

  const isInlineFlow =
    selectedGateway !== null &&
    (selectedGateway.includes("agent") || selectedGateway.includes("personal"));

  const onPay = async () => {
    if (!selectedGateway) return;

    // Inline flow for any *-agent or *-personal
    if (isInlineFlow) {
      setShowInlineFlow(true);
      return;
    }

    // Only *-merchant redirects
    if (selectedGateway.includes("merchant")) {
      setLoading(true);

      const base = process.env.BASE_URL;
      const path = selectedGateway.startsWith("bkash")
        ? "get-payment/bkash"
        : selectedGateway.startsWith("nagad")
        ? "get-payment/nagad"
        : "get-payment/rocket";

      const url = `${base}/${path}/?invoice_payment_id=${encodeURIComponent(
        invoice_payment_id ?? ""
      )}&redirect=1`;

      await new Promise((r) => setTimeout(r, 150));
      window.location.href = url;
      return;
    }

    toast("Unsupported method", { icon: "🤔" });
  };

  if (!validInvoice) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-rose-600">Invalid Invoice</h1>
          <p className="text-slate-600">We couldn’t find that invoice ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg"
      >
        <AnimatePresence mode="wait">
          {!showInlineFlow ? (
            /* -------------------- PAYMENT UI -------------------- */
            <motion.div
              key="payment-ui"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="relative overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
            >
              {/* top bar */}
              <div className="absolute right-3 top-3">
                <button
                  aria-label="Close"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  onClick={() => alert("Close modal")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Top purple logo area */}
              <div className="bg-purple-100 flex items-center justify-center py-6">
                <span className="text-purple-700 font-bold text-xl">৳</span>
              </div>

              {/* Merchant info */}
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-violet-100 grid place-items-center">
                      <Image
                        src={mechant_info?.brand_logo || "/zeonix-logo.png"}
                        alt="brand"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <h2 className="font-semibold text-gray-800">
                      {mechant_info?.brand_name || "PAYSTATION"}
                    </h2>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Invoice: {invoice_payment_id?.slice(0, 8) || "—"}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b text-sm font-medium text-gray-600">
                <button className="flex-1 py-3 border-b-2 border-purple-600 text-purple-600">
                  M-Banking
                </button>
                <button className="flex-1 py-3 hover:text-purple-600">Cards</button>
                <button className="flex-1 py-3 hover:text-purple-600">Net-Banking</button>
              </div>

              {/* Providers grid */}
              <div className="px-6 py-6">
                <div className="grid grid-cols-3 gap-4">
                  {/* bKash */}
                  <LogoCard
                    label="bKash"
                    src="/geteway/bkash.svg"
                    tag="MERCHANT"
                    active={selectedGateway === "bkash-merchant"}
                    onClick={() => setSelectedGateway("bkash-merchant")}
                  />
                  <LogoCard
                    label="bKash"
                    src="/geteway/bkash.svg"
                    tag="PERSONAL"
                    active={selectedGateway === "bkash-personal"}
                    onClick={() => {
                      setSelectedGateway("bkash-personal");
                      setShowInlineFlow(true);
                    }}
                  />
                  <LogoCard
                    label="bKash"
                    src="/geteway/bkash.svg"
                    tag="AGENT"
                    active={selectedGateway === "bkash-agent"}
                    onClick={() => {
                      setSelectedGateway("bkash-agent");
                      setShowInlineFlow(true);
                    }}
                  />

                  {/* Nagad */}
                  <LogoCard
                    label="Nagad"
                    src="/geteway/nagad.svg"
                    tag="MERCHANT"
                    active={selectedGateway === "nagad-merchant"}
                    onClick={() => setSelectedGateway("nagad-merchant")}
                  />
                  <LogoCard
                    label="Nagad"
                    src="/geteway/nagad.svg"
                    tag="PERSONAL"
                    active={selectedGateway === "nagad-personal"}
                    onClick={() => {
                      setSelectedGateway("nagad-personal");
                      setShowInlineFlow(true);
                    }}
                  />
                  <LogoCard
                    label="Nagad"
                    src="/geteway/nagad.svg"
                    tag="AGENT"
                    active={selectedGateway === "nagad-agent"}
                    onClick={() => {
                      setSelectedGateway("nagad-agent");
                      setShowInlineFlow(true);
                    }}
                  />

                  {/* Rocket */}
                  <LogoCard
                    label="Rocket"
                    src="/geteway/rocket.svg"
                    tag="MERCHANT"
                    active={selectedGateway === "rocket-merchant"}
                    onClick={() => setSelectedGateway("rocket-merchant")}
                  />
                  <LogoCard
                    label="Rocket"
                    src="/geteway/rocket.svg"
                    tag="PERSONAL"
                    active={selectedGateway === "rocket-personal"}
                    onClick={() => {
                      setSelectedGateway("rocket-personal");
                      setShowInlineFlow(true);
                    }}
                  />
                  <LogoCard
                    label="Rocket"
                    src="/geteway/rocket.svg"
                    tag="AGENT"
                    active={selectedGateway === "rocket-agent"}
                    onClick={() => {
                      setSelectedGateway("rocket-agent");
                      setShowInlineFlow(true);
                    }}
                  />
                </div>
              </div>

              {/* Actions (only visible when a MERCHANT gateway is selected) */}
              {selectedGateway?.includes("merchant") && (
                <div className="space-y-3 px-6 pb-6">
                  <button
                    onClick={onPay}
                    disabled={loading}
                    className="w-full rounded-lg bg-purple-600 text-white py-3 font-semibold hover:bg-purple-700 disabled:opacity-60"
                  >
                    {loading ? "Processing…" : `Pay ${currency} ${amount.toFixed(2)}`}
                  </button>
                  <button
                    onClick={() => setSelectedGateway(null)}
                    className="w-full border py-3 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <div className="flex flex-col items-center gap-2 pt-1 text-center text-xs text-slate-500">
                    <p>
                      By clicking Pay, you agree to our{" "}
                      <a href="#" className="text-purple-600 hover:underline">
                        Terms and Conditions
                      </a>
                      .
                    </p>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Securely processed by</span>
                      <span className="font-semibold text-slate-700">Pay</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* -------------------- INLINE FLOW (agent/personal) -------------------- */
            <motion.div
              key="inline-flow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {selectedGateway && (
                <BkashAgentFlow
                  merchantName={mechant_info?.brand_name || "PAYSTATION"}
                  merchantInvoiceId={invoice_payment_id ?? ""}
                  merchantLogoSrc={
                    selectedGateway.startsWith("bkash")
                      ? "/geteway/bkash.svg"
                      : selectedGateway.startsWith("nagad")
                      ? "/geteway/nagad.svg"
                      : "/geteway/rocket.svg"
                  }
                  receiverMsisdn={
                    selectedGateway.startsWith("bkash")
                      ? "01770618575"
                      : selectedGateway.startsWith("nagad")
                      ? "01XXXXXXXXX"
                      : "01YYYYYYYYY"
                  }
                  amount={amount}
                  paymentMethod={selectedGateway}
                  onBack={() => setShowInlineFlow(false)}  // back to payment page
                  onClose={() => setShowInlineFlow(false)} // cancel behaves the same
                  onVerifyTrx={async (trx) => {
                    // TODO: wire to your API
                    console.log("Verify", selectedGateway, trx);
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* tiny help row (hidden while inline flow is shown) */}
        {!showInlineFlow && (
          <div className="mx-auto mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span>Need help?</span>
            <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 hover:bg-slate-50">
              <span>Contact support</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/** ---------- small UI helpers ---------- */
function LogoCard({
  src,
  label,
  tag,
  active,
  onClick,
}: {
  src: string;
  label: string;
  tag?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative flex h-20 w-full items-center justify-center rounded-lg border bg-white transition",
        active ? "border-purple-500 ring-1 ring-purple-200" : "border-slate-200 hover:shadow-md",
      ].join(" ")}
    >
      <Image src={src} alt={label} width={70} height={70} className="object-contain" />
      {tag && (
        <span className="absolute top-1 right-2 rounded bg-gray-200/90 px-1 text-[10px] font-semibold">
          {tag}
        </span>
      )}
    </button>
  );
}
