import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Allow overriding the API base when running the client dev server separately
// In production, API calls go to the same origin
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}
const API_BASE = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_API_URL || "" : "";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith("/") && API_BASE ? `${API_BASE}${url}` : url;

  const headers: Record<string, string> = {};
  if (data) headers["Content-Type"] = "application/json";
  // Session-based auth - no token needed, cookies are sent automatically

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Important: sends cookies with request
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const path = queryKey.join("/") as string;
      const fullUrl = path.startsWith("/") && API_BASE ? `${API_BASE}${path}` : path;

      const res = await fetch(fullUrl, {
        credentials: "include", // Important: sends cookies with request
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
