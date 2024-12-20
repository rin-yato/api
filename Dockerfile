FROM denoland/deno

WORKDIR /app

USER deno

COPY . .

RUN deno install

ENV PORT=8000

CMD ["run", "-A", "src/main.ts"]
