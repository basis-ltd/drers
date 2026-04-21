import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppDispatch } from '@/app/hooks';
import { useLoginMutation } from '../api/authApi';
import { credentialsReceived } from '../model/authSlice';
import type { LoginRequest } from '../model/types';
import { extractErrorMessage } from './errorMessage';

export function useLogin() {
  const [loginMutation, state] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const login = useCallback(
    async (input: LoginRequest, options?: { redirectTo?: string }) => {
      try {
        const response = await loginMutation(input).unwrap();
        dispatch(credentialsReceived(response));
        toast.success(`Welcome back, ${response.user.firstName}`);
        navigate(options?.redirectTo ?? '/', { replace: true });
        return { success: true as const, response };
      } catch (error) {
        const message = extractErrorMessage(error as never, 'Unable to sign in.');
        toast.error(message);
        return { success: false as const, message };
      }
    },
    [dispatch, loginMutation, navigate],
  );

  return { login, isLoading: state.isLoading, error: state.error };
}
