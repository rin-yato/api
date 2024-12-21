FROM denoland/deno

WORKDIR /app

ADD . /app

RUN deno install --entrypoint src/main.ts

ENV PORT=8000
EXPOSE 8000

CMD ["run", "-A", "src/main.ts"]

