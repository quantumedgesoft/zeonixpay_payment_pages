"use client";

import { useEffect, useMemo, useState } from "react";
import { X, ShieldCheck, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BkashAgentFlow from "../components/BkashAgentFlow";

interface InvoiceData {
  status: boolean;
  invoice: { amount: number };
  mechant_info: { brand_name: string; brand_logo: string };
  payment_methods: Array<{ method: string; url: string }>;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showInlineFlow, setShowInlineFlow] = useState(false);
  const invoice_payment_id = searchParams.get("invoice_payment_id") ?? "";
  const methodParamRaw = searchParams.get("method");

  /* --------- Fetch invoice --------- */
  useEffect(() => {
    setInvoiceData(null);
    setError(null);

    if (!invoice_payment_id) {
      setError("Missing invoice ID.");
      return;
    }

    let cancelled = false;
    const fetchInvoiceData = async () => {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.BASE_URL;
        const res = await fetch(
          `${base}/get-payment/?invoice_payment_id=${encodeURIComponent(invoice_payment_id)}`,
          { cache: "no-store" }
        );
        const data = (await res.json()) as InvoiceData;
        console.log(data)

        if (cancelled) return;

        if (res.ok && data?.status) {
          setInvoiceData(data);
          setError(null);
        } else {
          setInvoiceData(null);
          setError("We couldn’t find that invoice ID.");
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setInvoiceData(null);
          setError("Something went wrong while fetching the invoice.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInvoiceData();
    return () => {
      cancelled = true;
    };
  }, [invoice_payment_id]);


  // Keep only methods whose URL starts with http
  const availableMethods = useMemo(() => {
    const list = invoiceData?.payment_methods ?? [];
    return list.filter((m) => /^https?:\/\//i.test(m.url));
  }, [invoiceData]);
console.log(availableMethods)
  const methodToUrl = useMemo(() => {
    const map = new Map<string, string>();
    availableMethods.forEach(({ method, url }) => map.set(method, url));
    return map;
  }, [availableMethods]);

  const invoice = invoiceData?.invoice;
  const mechant_info = invoiceData?.mechant_info;

  const amount = invoice?.amount ?? 0;
  const currency = "BDT";

  /* --------- Sync UI with ?method= param (only if method exists in available list) --------- */
  useEffect(() => {
    const valid =
      methodParamRaw && methodToUrl.has(methodParamRaw) ? methodParamRaw : null;

    if (!valid) {
      setSelectedMethod(null);
      setShowInlineFlow(false);
      return;
    }

    setSelectedMethod(valid);
    setShowInlineFlow(valid.includes("personal") || valid.includes("agent"));
  }, [methodParamRaw, methodToUrl]);

  /* --------- Helpers --------- */
  function setMethodInUrl(method: string | null) {
    const url = new URL(window.location.href);
    if (method) url.searchParams.set("method", method);
    else url.searchParams.delete("method");
    if (invoice_payment_id) {
      url.searchParams.set("invoice_payment_id", invoice_payment_id);
    }
    router.replace(url.toString(), { scroll: false });
  }

  const chooseMethod = (method: string) => setMethodInUrl(method);

  const backToMenu = () => setMethodInUrl(null);

  const onPay = async () => {
    if (!selectedMethod) return;

    // Merchant flow: redirect to the API-provided URL
    const redirectUrl = methodToUrl.get(selectedMethod);
    if (!redirectUrl) {
      toast.error("No redirect URL found for this method.");
      return;
    }

    // Inline flows shouldn't reach here; only merchant (no '-' suffix)
    if (!selectedMethod.includes("-")) {
      window.location.href = redirectUrl;
      return;
    }

    toast("Unsupported method", { icon: "🤔" });
  };

  /* --------- Skeleton while fetching --------- */
  if (loading && !invoiceData && !error) {
    return (
      <div className="w-full max-w-lg animate-pulse space-y-4 p-4 mx-auto">
        <div className="h-16 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-6 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto" />
        </div>

        <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div key={idx} className="h-20 bg-slate-100 rounded" />
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  /* --------- Error state --------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-rose-600">Invalid Invoice</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  /* --------- Render ---------- */
  const isInlineFlow =
    !!selectedMethod &&
    (selectedMethod.includes("personal") || selectedMethod.includes("agent"));

  const merchantSelected =
    !!selectedMethod && !selectedMethod.includes("-"); // e.g. "bkash", "nagad", "rocket"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg"
      >
        <AnimatePresence mode="wait">
          {!isInlineFlow ? (
            <motion.div
              key="payment-ui"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="relative overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
            >
              {/* close btn */}
              <div className="absolute right-3 top-3">
                <button
                  aria-label="Close"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  onClick={() => alert("Close modal")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* amount header */}
              <div className="bg-purple-100 flex items-center justify-center py-6">
                <span className="text-purple-700 font-bold text-xl">
                  {currency} {amount}
                </span>
              </div>

              {/* merchant info */}
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

              {/* tabs (static) */}
              <div className="flex border-b text-sm font-medium text-gray-600">
                <button className="flex-1 py-3 border-b-2 border-purple-600 text-purple-600">
                  M-Banking
                </button>
                <button className="flex-1 py-3 hover:text-purple-600">Cards</button>
                <button className="flex-1 py-3 hover:text-purple-600">Net-Banking</button>
              </div>

              {/* providers grid (dynamic) */}
              <div className="px-6 py-6">
                <div className="grid grid-cols-3 gap-4">
                  {availableMethods.map(({ method }) => {
                    const { base, tag, logo, label } = describeMethod(method);
                    const active = selectedMethod === method;

                    return (
                      <LogoCard
                        key={method}
                        label={label}
                        src={logo}
                        tag={tag}
                        active={active}
                        onClick={() => chooseMethod(method)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* actions for MERCHANT (method without '-') */}
              {merchantSelected && (
                <div className="space-y-3 px-6 pb-6">
                  <button
                    onClick={onPay}
                    disabled={loading}
                    className="w-full rounded-lg bg-purple-600 text-white py-3 font-semibold hover:bg-purple-700 disabled:opacity-60"
                  >
                    {loading ? "Processing…" : `Pay ${currency} ${amount.toFixed(2)}`}
                  </button>
                  <button
                    onClick={() => setMethodInUrl(null)}
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
            <motion.div
              key="inline-flow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {selectedMethod && (
                <BkashAgentFlow
                  merchantName={mechant_info?.brand_name || "PAYSTATION"}
                  brandLogo={mechant_info?.brand_logo || "PAYSTATION"}
                  merchantInvoiceId={invoice_payment_id}
                  merchantLogoSrc={getLogo(describeMethod(selectedMethod).base)}
                  receiverMsisdn={
                    selectedMethod.startsWith("bkash")
                      ? "01770618575"
                      : selectedMethod.startsWith("nagad")
                      ? "01XXXXXXXXX"
                      : "01YYYYYYYYY"
                  }
                  amount={amount}
                  paymentMethod={selectedMethod}
                  onBack={backToMenu}
                  onClose={backToMenu}
                  onVerifyTrx={async (trx) => {
                    console.log("Verify", selectedMethod, trx);
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isInlineFlow && (
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

/* ---------- helpers ---------- */
function describeMethod(method: string) {
  const parts = method.split("-");
  const base = parts[0]; // bkash / nagad / rocket / bank...
  const suffix = parts[1]; // undefined / personal / agent / merchant

  const tag =
    suffix === "personal"
      ? "PERSONAL"
      : suffix === "agent"
      ? "AGENT"
      : "MERCHANT";

  const logo = getLogo(base);
  const label =
    base === "bkash" ? "bKash" : base === "nagad" ? "Nagad" : base === "rocket" ? "Rocket" : base;

  return { base, tag, logo, label };
}

function getLogo(base: string) {
  if (base === "bkash") return "/geteway/bkash.svg";
  if (base === "nagad") return "/geteway/nagad.svg";
  if (base === "rocket") return "/geteway/rocket.svg";
  return "/zeonix-logo.png";
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
