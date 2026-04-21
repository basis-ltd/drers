import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthTokens, AuthUser, LoginResponse } from './types';

const STORAGE_KEY = 'rnec.auth.v1';

interface PersistedAuth {
  user: AuthUser | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: string | null;
  isHydrated: boolean;
}

function loadPersisted(): PersistedAuth {
  if (typeof window === 'undefined') {
    return { user: null, refreshToken: null, refreshTokenExpiresAt: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, refreshToken: null, refreshTokenExpiresAt: null };
    const parsed = JSON.parse(raw) as PersistedAuth;
    return {
      user: parsed.user ?? null,
      refreshToken: parsed.refreshToken ?? null,
      refreshTokenExpiresAt: parsed.refreshTokenExpiresAt ?? null,
    };
  } catch {
    return { user: null, refreshToken: null, refreshTokenExpiresAt: null };
  }
}

function persist(state: AuthState) {
  if (typeof window === 'undefined') return;
  try {
    if (!state.refreshToken) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload: PersistedAuth = {
      user: state.user,
      refreshToken: state.refreshToken,
      refreshTokenExpiresAt: state.refreshTokenExpiresAt,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
}

const persisted = loadPersisted();

const initialState: AuthState = {
  user: persisted.user,
  accessToken: null,
  refreshToken: persisted.refreshToken,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: persisted.refreshTokenExpiresAt,
  isHydrated: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsReceived(state, action: PayloadAction<LoginResponse>) {
      const p = action.payload;
      state.user = p.user;
      state.accessToken = p.accessToken;
      state.refreshToken = p.refreshToken;
      state.accessTokenExpiresAt = Date.now() + p.accessTokenExpiresIn * 1000;
      state.refreshTokenExpiresAt = p.refreshTokenExpiresAt;
      persist(state);
    },
    tokensRefreshed(state, action: PayloadAction<AuthTokens & { user?: AuthUser }>) {
      const p = action.payload;
      state.accessToken = p.accessToken;
      state.refreshToken = p.refreshToken;
      state.accessTokenExpiresAt = Date.now() + p.accessTokenExpiresIn * 1000;
      state.refreshTokenExpiresAt = p.refreshTokenExpiresAt;
      if (p.user) state.user = p.user;
      persist(state);
    },
    userUpdated(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      persist(state);
    },
    loggedOut(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.accessTokenExpiresAt = null;
      state.refreshTokenExpiresAt = null;
      persist(state);
    },
  },
});

export const { credentialsReceived, tokensRefreshed, userUpdated, loggedOut } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
export type { AuthState };
