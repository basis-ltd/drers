import { useCallback } from 'react';
import { toast } from 'sonner';
import { useForgotPasswordMutation } from '../api/authApi';
import type { ForgotPasswordRequest } from '../model/types';
import { extractErrorMessage } from './errorMessage';

export function useForgotPassword() {
  const [mutate, state] = useForgotPasswordMutation();

  const requestReset = useCallback(
    async (input: ForgotPasswordRequest) => {
      try {
        const response = await mutate(input).unwrap();
        toast.success('Check your email', {
          description: response.message,
        });
        return { success: true as const, response };
      } catch (error) {
        const message = extractErrorMessage(error as never, 'Unable to start password reset.');
        toast.error(message);
        return { success: false as const, message };
      }
    },
    [mutate],
  );

  return { requestReset, isLoading: state.isLoading, error: state.error };
}
