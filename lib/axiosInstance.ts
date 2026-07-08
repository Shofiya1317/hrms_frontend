/* eslint-disable @typescript-eslint/no-explicit-any */
 
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  ResponseType,
} from 'axios';
import { getToken as getServerToken } from 'next-auth/jwt';
import { AuthService } from './service';
import { buildQueryParams, Params } from './utils';
 
export const BASE_URL = process.env.NEXT_PUBLIC_BE;
 
export interface AxiosOptions {
  baseUrl?: string;
  responseType?: ResponseType;
  contentType?: string;
  basicToken?: string;
  bearerToken?: string;
  isFetchToken?: boolean;
}
 
interface ErrorResponse {
  data: {
    error?: string | string[] | any;
    success?: boolean;
  };
}
 
interface CustomResponse<T> {
  data: T | ErrorResponse | any;
  status?: number | string;
  statusMessage?: string;
}
 
let cachedSession: any = null;
let clientSessionPromise: Promise<any> | null = null;
let lastFetchTime = 0;

export const invalidateSessionCache = () => {
  cachedSession = null;
  lastFetchTime = 0;
};

const getClientSession = async () => {
  const now = Date.now();
  if (cachedSession && (now - lastFetchTime < 5 * 60 * 1000)) { // 5 minutes cache
    return cachedSession;
  }
  if (!clientSessionPromise) {
    clientSessionPromise = import('next-auth/react').then(async ({ getSession }) => {
      const session = await getSession();
      cachedSession = session;
      lastFetchTime = Date.now();
      clientSessionPromise = null;
      return session;
    }).catch(err => {
      clientSessionPromise = null;
      return null;
    });
  }
  return clientSessionPromise;
};

/**
 * Safely resolves the session token depending on the execution context:
 * - Server Component / API Route: uses next-auth/jwt getServerToken (req required)
 * - Client Component:            dynamically imports getSession from next-auth/react
 *                                to avoid the "not a function" webpack error
 * - isFetchToken = false:        skips session resolution entirely (caller provides token)
 */
const getToken = async (req?: any, isFetchToken: boolean = true) => {
  // Server-side: req is available (API route / middleware / server component with headers)
  if (req) {
    const token = await getServerToken({
      req,
      secret: process.env.AUTH_SECRET ?? '',
    });
    return token ?? null;
  }
 
  // Caller is supplying a token directly — skip session fetch
  if (!isFetchToken) {
    return null;
  }
 
  // Client-side only: dynamic import prevents the module from being evaluated
  // during SSR / server-component rendering where the function doesn't exist
  if (typeof window !== 'undefined') {
    const session = await getClientSession();
    return (session as unknown as { user: object })?.user ?? null;
  }
 
  // Server Component without req — use next-auth/jwt with next/headers
  try {
    const { cookies } = await import('next/headers');
    const { getToken: getJwtToken } = await import('next-auth/jwt');
    const cookieStore = await cookies();
 
    // Build a minimal request-like object from the cookie store
    const cookieHeader = cookieStore
      .getAll()
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join('; ');
 
    const token = await getJwtToken({
      req: {
        headers: { cookie: cookieHeader },
        cookies: Object.fromEntries(
          cookieStore.getAll().map((c: { name: string; value: string }) => [c.name, c.value]),
        ),
      } as any,
      secret: process.env.AUTH_SECRET ?? '',
    });
 
    return token ?? null;
  } catch {
    // Fallback: if headers() throws (e.g. in middleware), return null gracefully
    return null;
  }
};
 
const getUrl = (url: string, params?: Params | undefined | null) =>
  !buildQueryParams(params) ? `${url}` : `${url}?${buildQueryParams(params)}`;
 
export const createAxiosInstance = async (
  options?: AxiosOptions,
  tenantId?: string,
  req?: any,
): Promise<AxiosInstance> => {
  const token = await getToken(req, options?.isFetchToken);
  const accessToken = (token as unknown as { accessToken: string })?.accessToken;
  const refreshToken = (token as unknown as { refreshToken: string })?.refreshToken;
 
  const axiosInstance = axios.create({
    baseURL: options?.baseUrl ?? BASE_URL,
    headers: {
      'Content-Type': options?.contentType ?? 'application/json',
    },
  });
 
  // ── Request interceptor ───────────────────────────────────────────────────
  axiosInstance.interceptors.request.use(async (config) => {
    const newConfig = { ...config };
 
    if (options?.bearerToken) {
      newConfig.headers.Authorization = `Bearer ${options.bearerToken}`;
    } else if (options?.basicToken) {
      newConfig.headers.API_KEY = options.basicToken;
    } else if (accessToken) {
      newConfig.headers.Authorization = `Bearer ${accessToken}`;
    }
 
    if (tenantId) {
      newConfig.headers['X-Tenant-Id'] = tenantId;
    }
 
    return newConfig;
  });
 
  // ── Response interceptor ──────────────────────────────────────────────────
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest: any = error.config;
 
      if (
        error?.response?.status === 401 &&
        !originalRequest._retry &&
        refreshToken
      ) {
        originalRequest._retry = true; // use a flag on the request itself, not a closure var
        try {
          const slug =
            typeof window !== 'undefined'
              ? localStorage.getItem('slug') ?? ''
              : '';
 
          await AuthService.refreshToken(slug, refreshToken);
          invalidateSessionCache();
          return axiosInstance(originalRequest);
        } catch (err) {
          // Only call signOut on the client
          if (typeof window !== 'undefined') {
            const { signOut } = await import('next-auth/react');
            invalidateSessionCache();
            signOut();
          }
          return Promise.reject(err);
        }
      }
 
      return Promise.reject(error);
    },
  );
 
  return axiosInstance;
};
 
// ── HTTP helpers ──────────────────────────────────────────────────────────────
 
export async function get<T>(
  url: string,
  params?: Params | undefined | null,
  tenantId?: string,
  options?: AxiosOptions,
  req?: any,
): Promise<CustomResponse<T>> {
  return (await createAxiosInstance(options, tenantId, req))
    .get(getUrl(url, params))
    .then((response: AxiosResponse<T>) => ({
      data: response.data,
      status: response.status,
    }))
    .catch((error: AxiosError<ErrorResponse>) => ({
      data: error.response?.data ?? error.message,
      status: error.response?.status,
    }));
}
 
export async function post<T>(
  url: string,
  body: T,
  params?: Params | undefined | null,
  tenantId?: string,
  options?: AxiosOptions,
  req?: any,
): Promise<CustomResponse<T>> {
  return (await createAxiosInstance(options, tenantId, req))
    .post(getUrl(url, params), body)
    .then((response: AxiosResponse<T>) => ({
      data: response.data,
      status: response.status,
    }))
    .catch((error: AxiosError<ErrorResponse>) => ({
      data: error.response?.data ?? error.message,
      status: error.response?.status,
    }));
}
 
export async function put<T>(
  url: string,
  body: T,
  params?: Params | undefined | null,
  tenantId?: string,
  options?: AxiosOptions,
  req?: any,
): Promise<CustomResponse<T>> {
  return (await createAxiosInstance(options, tenantId, req))
    .put(getUrl(url, params), body)
    .then((response: AxiosResponse<T>) => ({
      data: response.data,
      status: response.status,
    }))
    .catch((error: AxiosError<ErrorResponse>) => ({
      data: error.response?.data ?? error.message,
      status: error.response?.status,
    }));
}
 
export async function patch<T>(
  url: string,
  body: T,
  tenantId?: string,
  options?: AxiosOptions,
  req?: any,
): Promise<CustomResponse<T>> {
  return (await createAxiosInstance(options, tenantId, req))
    .patch(url, body)
    .then((response: AxiosResponse<T>) => ({
      data: response.data,
      status: response.status,
    }))
    .catch((error: AxiosError<ErrorResponse>) => ({
      data: error.response?.data ?? error.message,
      status: error.response?.status,
    }));
}
 
export async function deleteRequest<T>(
  url: string,
  params?: Params | undefined | null,
  tenantId?: string,
  body?: Params | undefined,
  options?: AxiosOptions,
  req?: any,
): Promise<CustomResponse<T>> {
  return (await createAxiosInstance(options, tenantId, req))
    .delete(getUrl(url, params), { data: body })
    .then((response: AxiosResponse<T>) => ({
      data: response.data,
      status: response.status,
    }))
    .catch((error: AxiosError<ErrorResponse>) => ({
      data: error.response?.data ?? error.message,
      status: error.response?.status,
    }));
}
 
export async function downloadPost(
  url: string,
  body: any,
  params?: Params | undefined | null,
  tenantId?: string,
  options?: AxiosOptions,
  req?: undefined,
) {
  const token = await getToken(req, options?.isFetchToken);
  const accessToken = (token as unknown as { accessToken: string })?.accessToken;
 
  return fetch(`${options?.baseUrl ?? BASE_URL}${getUrl(url, params)}`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      Authorization: `Bearer ${options?.bearerToken ?? accessToken}`,
      'X-Tenant-Id': tenantId ?? '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
 