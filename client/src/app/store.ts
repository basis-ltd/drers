import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authReducer } from '@/features/auth/model/authSlice';
import { authApi } from '@/features/auth/api/authApi';
import { applicationsApi } from '@/features/applications/api/applicationsApi';
import { reviewsApi } from '@/features/reviews/api/reviewsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [applicationsApi.reducerPath]: applicationsApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      authApi.middleware,
      applicationsApi.middleware,
      reviewsApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
