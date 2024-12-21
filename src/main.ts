import { Hono } from "hono";
import { logger } from "hono/logger";

import { KHQRRoute } from "./routes/khqr.tsx";

const app = new Hono();
app.use(logger());

app.route("/", KHQRRoute);

app.get("/", (c) => c.text("HOLA"));
app.get("/ping", (c) => c.text("pong"));

Deno.serve(app.fetch);
