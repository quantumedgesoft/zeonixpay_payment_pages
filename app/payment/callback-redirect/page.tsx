"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyApiEnvelope = {
    status: boolean;
    data?: {
        invoice_payment_id: string;
        trxID: string;
        amount: number;
        transactionStatus: string;
        client_callback_url?: string;
    };
    message?: string;
};

export default function VerifyPaymentCard() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [data, setData] = useState<VerifyApiEnvelope["data"] | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const invoice_payment_id = searchParams.get("invoice_payment_id") ?? "";
    const status = searchParams.get("status") ?? "";

    useEffect(() => {
        if (!invoice_payment_id || !status) {
            setErr("Missing invoice_payment_id or status.");
            return;
        }

        const run = async () => {
            try {
                setLoading(true);
                setErr(null);

                const res = await fetch(`${process.env.BASE_URL}/payment/verify/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoice_payment_id, status }),
                });

                const json: VerifyApiEnvelope = await res.json().catch(() => ({ status: false }));
                if (!res.ok || !json.data) {
                    setErr(json.message || "Verification failed");
                    return;
                }

                setData(json.data);

                // if backend provides a callback URL, start a 5s countdown
                if (json.data.client_callback_url) {
                    setCountdown(5);
                }
            } catch (e) {
                setErr("Network error");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [invoice_payment_id, status]);
    console.log(data)

    // handle auto-redirect when countdown is active
    useEffect(() => {
        if (!countdown || !data?.client_callback_url) return;

        // tick every second
        const tick = setInterval(() => {
            setCountdown((prev) => (prev && prev > 0 ? prev - 1 : prev));
        }, 1000);

        // hard redirect after 5s (or when countdown hits 0)
        const go = setTimeout(() => {
            window.location.assign(data.client_callback_url!);
        }, countdown * 1000);

        return () => {
            clearInterval(tick);
            clearTimeout(go);
        };
    }, [countdown, data?.client_callback_url]);

    const handleGoNow = () => {
        if (data?.client_callback_url) {
            window.location.assign(data.client_callback_url);
        }
    };

    if (loading) return <p className="p-4 min-h-screen">Verifying…</p>;
    if (err) return <p className="p-4 text-red-600 min-h-screen">{err}</p>;
    if (!data) return null;

    const prettyAmount = `BDT ${Number(data.amount).toFixed(2)}`;

    const statusClass =
        data.transactionStatus.toLowerCase() === "completed" ||
            data.transactionStatus.toLowerCase() === "success"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : data.transactionStatus.toLowerCase() === "pending"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200";

    return (
        <div className="min-h-screen">
            <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
                {/* header */}
                <div className="flex flex-col items-center gap-2 pt-8 pb-4">
                    <div
                        className={`grid h-12 w-12 place-items-center rounded-full ${data.transactionStatus.toLowerCase() === "incomplete"
                            ? "bg-rose-600"
                            : "bg-emerald-600"
                            }`}
                    >
                        {data.transactionStatus.toLowerCase() === "incomplete" ? (
                            // red cross
                            <svg
                                className="h-7 w-7 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        ) : (
                            // green check
                            <svg
                                className="h-7 w-7 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        )}
                    </div>
                    <h2
                        className={`text-[18px] font-semibold ${data.transactionStatus.toLowerCase() === "Incomplete"
                            ? "text-rose-700"
                            : "text-emerald-700"
                            }`}
                    >
                        {data.transactionStatus.toLowerCase() === "incomplete"
                            ? "Payment failed"
                            : "Payment successful"}
                    </h2>
                </div>


                {/* body */}
                <div className="px-8 pb-6">
                    <div className="grid grid-cols-12 gap-y-3 text-[13px] leading-5">
                        <Label>Invoice id</Label>
                        <Value className="font-mono break-all">{data.invoice_payment_id}</Value>

                        <Label>Transaction id</Label>
                        <Value className="font-mono break-all">{data.trxID}</Value>

                        <Label>Amount paid</Label>
                        <Value className="font-semibold">{prettyAmount}</Value>

                        <Label>Status</Label>
                        <Value>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClass}`}>
                                {data.transactionStatus}
                            </span>
                        </Value>
                    </div>

                    {/* redirect notice + actions (only if callback url provided) */}
                    {data.client_callback_url && (
                        <div className="mt-6 text-center space-y-2">
                            <p className="text-[12px] text-slate-600">
                                Redirecting to your app in{" "}
                                <span className="font-semibold text-slate-800">
                                    {countdown ?? 5}s
                                </span>
                                …
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => window.print()}
                                    className="rounded-md bg-sky-600 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-700"
                                    type="button"
                                >
                                    PRINT
                                </button>
                                <button
                                    onClick={handleGoNow}
                                    className="rounded-md bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                    type="button"
                                >
                                    Go now
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* tiny helpers for the two-column layout */
function Label({ children }: { children: React.ReactNode }) {
    return <div className="col-span-6 text-slate-500">{children}</div>;
}
function Value({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <div className={`col-span-6 text-slate-800 ${className}`}>{children}</div>;
}
