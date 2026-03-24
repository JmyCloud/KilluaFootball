import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { SportMonksResponse, PaginatedResponse } from "@/types/sportmonks";

const BASE_URL = "https://api.sportmonks.com/v3/football";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30_000;

function getApiToken(): string {
  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) {
    throw new Error("SPORTMONKS_API_TOKEN is not set in environment variables");
  }
  return token;
}

function createAxiosInstance(): AxiosInstance {
  return axios.create({
    baseURL: BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
    params: {
      api_token: getApiToken(),
    },
  });
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sportmonksGet<T = unknown>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<SportMonksResponse<T>> {
  const client = createAxiosInstance();
  const cleanParams: Record<string, string | number> = {};
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined) cleanParams[key] = val;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const config: AxiosRequestConfig = { params: cleanParams };
      const response = await client.get<SportMonksResponse<T>>(path, config);
      return response.data;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 429) {
          const retryAfter = Number(err.response?.headers["retry-after"]) || 5;
          await sleep(retryAfter * 1000);
          continue;
        }
        if (status && status >= 400 && status < 500 && status !== 429) {
          throw lastError;
        }
      }

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new Error("sportmonksGet failed after retries");
}

export async function sportmonksGetAllPages<T = unknown>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T[]> {
  const allItems: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = (await sportmonksGet<T[]>(path, {
      ...params,
      page,
    })) as PaginatedResponse<T>;

    if (Array.isArray(response.data)) {
      allItems.push(...response.data);
    }

    hasMore = response.pagination?.has_more ?? false;
    page++;
  }

  return allItems;
}
