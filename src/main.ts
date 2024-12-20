import { Hono } from "hono";

import { KHQRRoute } from "./routes/khqr.tsx";

const app = new Hono();

app.route("/", KHQRRoute);

app.get("/", (c) => c.text("HOLA"));
app.get("/ping", (c) => c.text("pong"));

Deno.serve(app.fetch);
