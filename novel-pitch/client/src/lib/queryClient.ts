import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
}

// Use relative URLs for API calls — works both locally and deployed
export async function apiRequest(
  method: string,
  url: string,
  body?: unknown
): Promise<Response> {
  // __PORT_5000__ is replaced at deploy time; falls back to relative URL locally
  const base = (window as any).__PORT_5000__ ?? "";
  const fullUrl = `${base}${url}`;
  const res = await fetch(fullUrl, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  await throwIfResNotOk(res);
  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});
