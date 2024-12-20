import { Hono } from "hono";

import { KHQRRoute } from "./routes/khqr.tsx";

const app = new Hono();

app.route("/", KHQRRoute);

Deno.serve(app.fetch);
