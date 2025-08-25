import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.PAGE_SIGNING_SECRET!; // set this env in the separate app

export function verifySignature(paymentId: string, exp: number, sig: string) {
  const payload = `${paymentId}|${exp}`;
  const expected = createHmac("sha256", SECRET).update(payload).digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sig || "", "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
