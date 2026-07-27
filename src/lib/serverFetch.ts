import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

/**
 * Outbound HTTP via Node http/https — bypasses Next.js's patched global `fetch`,
 * which can retain IncrementalCache / response bodies on keep-alive sockets
 * and grow heap until OOM in standalone Docker deployments.
 */

const DEFAULT_TIMEOUT_MS = 15_000;

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 10_000,
  maxSockets: 8,
  maxFreeSockets: 4,
  timeout: 30_000,
});

const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 10_000,
  maxSockets: 8,
  maxFreeSockets: 4,
  timeout: 30_000,
});

export type ServerFetchInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
};

export type ServerFetchResponse = {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
  json: <T = unknown>() => Promise<T>;
};

export function getBackendUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "";
  return url.replace(/\/$/, "");
}

export async function serverFetch(
  url: string,
  init: ServerFetchInit = {}
): Promise<ServerFetchResponse> {
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const method = init.method ?? "GET";
  const parsed = new URL(url);
  const isHttps = parsed.protocol === "https:";
  const lib = isHttps ? https : http;
  const agent = isHttps ? httpsAgent : httpAgent;
  const body = init.body;

  const headers: Record<string, string> = { ...(init.headers ?? {}) };
  if (body != null && headers["Content-Length"] == null) {
    headers["Content-Length"] = String(Buffer.byteLength(body));
  }

  const { statusCode, textPayload } = await new Promise<{
    statusCode: number;
    textPayload: string;
  }>((resolve, reject) => {
    const req = lib.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: `${parsed.pathname}${parsed.search}`,
        method,
        headers,
        agent,
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            textPayload: Buffer.concat(chunks).toString("utf8"),
          });
        });
        res.on("error", reject);
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error(`Request timed out after ${timeoutMs}ms`));
    });
    req.on("error", reject);

    if (body != null) req.write(body);
    req.end();
  });

  return {
    ok: statusCode >= 200 && statusCode < 300,
    status: statusCode,
    text: async () => textPayload,
    json: async <T = unknown>() => JSON.parse(textPayload) as T,
  };
}
