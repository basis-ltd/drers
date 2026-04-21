import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';
import { credentialsReceived, loggedOut, tokensRefreshed } from '../model/authSlice';
import type { RefreshResponse } from '../model/types';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

// Single-flight refresh: concurrent 401s await the same promise.
let refreshPromise: Promise<RefreshResponse | null> | null = null;

async function performRefresh(
  api: Parameters<BaseQueryFn<FetchArgs, unknown, FetchBaseQueryError>>[1],
  refreshToken: string,
): Promise<RefreshResponse | null> {
  const result = await rawBaseQuery(
    {
      url: '/auth/refresh',
      method: 'POST',
      body: { refreshToken },
    },
    api,
    {},
  );

  if (result.error) return null;
  return result.data as RefreshResponse;
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) return result;

  const state = api.getState() as RootState;
  const refreshToken = state.auth.refreshToken;

  // No refresh token — nothing to retry. Treat as hard logout.
  if (!refreshToken) {
    api.dispatch(loggedOut());
    return result;
  }

  // Don't try to refresh the refresh endpoint itself.
  const url = typeof args === 'string' ? args : args.url;
  if (url.endsWith('/auth/refresh')) {
    api.dispatch(loggedOut());
    return result;
  }

  try {
    if (!refreshPromise) {
      refreshPromise = performRefresh(api, refreshToken);
    }
    const refreshed = await refreshPromise;

    if (!refreshed) {
      api.dispatch(loggedOut());
      return result;
    }

    // Persist both tokens + user so subsequent requests use the new access token.
    api.dispatch(credentialsReceived(refreshed));
    void tokensRefreshed; // keep named export used
    result = await rawBaseQuery(args, api, extraOptions);
  } finally {
    refreshPromise = null;
  }

  return result;
};
