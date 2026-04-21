import { useCallback } from 'react';
import { toast } from 'sonner';
import { useResendVerificationMutation } from '../api/authApi';
import { extractErrorMessage } from './errorMessage';

export function useResendVerification() {
  const [mutate, state] = useResendVerificationMutation();

  const resend = useCallback(
    async (email: string) => {
      try {
        const response = await mutate({ email }).unwrap();
        toast.success('Verification email sent', { description: response.message });
        return { success: true as const, response };
      } catch (error) {
        const message = extractErrorMessage(error as never, 'Unable to resend email.');
        toast.error(message);
        return { success: false as const, message };
      }
    },
    [mutate],
  );

  return { resend, isLoading: state.isLoading, error: state.error };
}
