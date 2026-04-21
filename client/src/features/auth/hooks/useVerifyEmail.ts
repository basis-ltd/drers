import { useCallback } from 'react';
import { toast } from 'sonner';
import { useVerifyEmailMutation } from '../api/authApi';
import { extractErrorMessage } from './errorMessage';

export function useVerifyEmail() {
  const [mutate, state] = useVerifyEmailMutation();

  const verifyEmail = useCallback(
    async (token: string) => {
      try {
        const response = await mutate({ token }).unwrap();
        toast.success('Email verified', { description: response.message });
        return { success: true as const, response };
      } catch (error) {
        const message = extractErrorMessage(error as never, 'Unable to verify email.');
        toast.error(message);
        return { success: false as const, message };
      }
    },
    [mutate],
  );

  return { verifyEmail, isLoading: state.isLoading, error: state.error };
}
