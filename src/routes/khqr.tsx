import { Hono } from "hono";
import { satoriResponse } from "../libs/satori.ts";
import qrcode from "qrcode";
import { KHQR as TSKHQR } from "ts-khqr";
import { z } from "zod";
import { formatCurrency } from "../libs/currency.ts";

const USD = Deno.readFileSync("src/assets/usd.png");
const RIEL = Deno.readFileSync("src/assets/riel.png");
const KHQR_LOGO = Deno.readFileSync("src/assets/khqr.png");
const RIEL_CURRENCY = Deno.readFileSync("src/assets/cambodian-riel-icon.png");

function KHQR(props: {
  qr: string;
  name: string;
  amount: number;
  currency: "USD" | "KHR";
  qrDataURL: string;
}) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", background: "white" }}
    >
      <div
        style={{
          display: "flex",
          background: "#E1242E",
          padding: "10px",
          justifyContent: "center",
        }}
      >
        {/* @ts-ignore */}
        <img src={KHQR_LOGO.buffer} alt="khqr logo" width={100} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "28px 36px",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "24px" }}>{props.name}</span>
        <span
          style={{
            fontSize: "46px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          {props.currency === "KHR" && (
            // @ts-ignore reason: ⭐
            <img src={RIEL_CURRENCY.buffer} width={24} />
          )}

          {props.currency === "USD"
            ? formatCurrency(props.amount)
            : props.amount}
        </span>
      </div>

      <div style={{ display: "flex", gap: "6px" }}>
        {[...new Array(40)].map(() => (
          <span
            style={{ height: "1px", flexGrow: 1, background: "gray" }}
          ></span>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          position: "relative",
        }}
      >
        {/* @ts-ignore */}
        <img src={props.qrDataURL} />

        <img
          // @ts-ignore reason: ⭐
          src={props.currency === "USD" ? USD.buffer : RIEL.buffer}
          style={{
            position: "absolute",
            width: 120,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </div>
  );
}

export const KHQRRoute = new Hono();

const khqrSchema = z.object({
  name: z.string(),
  amount: z.number({ coerce: true }),
  qr: z.string(),
  currency: z
    .union([z.literal("116"), z.literal("840")])
    .transform((v) => (v === "116" ? "KHR" : "USD")),
});

KHQRRoute.get("/khqr/:qr", async (c) => {
  const { qr } = c.req.param();

  const { data } = TSKHQR.parse(qr);

  if (!data) {
    return c.text("Invalid KHQR code", { status: 403 });
  }

  const khqrData = khqrSchema.safeParse({
    name: data.merchantName,
    amount: data.transactionAmount,
    currency: data.transactionCurrency,
    qr: qr,
  });
  if (!khqrData.success) {
    return c.text("Invalid KHQR code", { status: 403 });
  }

  const qrDataURL = await qrcode.toDataURL(qr, { scale: 40, margin: 4 });

  return satoriResponse(<KHQR {...khqrData.data} qrDataURL={qrDataURL} />);
});

KHQRRoute.post("/abakhqr", async (c) => {
  const body = await c.req.json();

  const { data } = TSKHQR.parse(body?.qrString);

  if (!data) {
    return c.text("Invalid KHQR code", { status: 403 });
  }

  const khqrData = khqrSchema.safeParse({
    name: data.merchantName,
    amount: data.transactionAmount,
    currency: data.transactionCurrency,
    qr: body?.qrString,
  });
  if (!khqrData.success) {
    return c.text("Invalid KHQR code", { status: 403 });
  }

  const qrDataURL = await qrcode.toDataURL(body?.qrString, {
    scale: 40,
    margin: 4,
  });

  return satoriResponse(<KHQR {...khqrData.data} qrDataURL={qrDataURL} />);
});
