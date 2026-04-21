import type { RootState } from '@/app/store';

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.user && state.auth.refreshToken);
export const selectIsEmailVerified = (state: RootState) =>
  Boolean(state.auth.user?.emailVerified);
