import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useResetPasswordMutation } from '../api/authApi';
import type { ResetPasswordRequest } from '../model/types';
import { extractErrorMessage } from './errorMessage';

export function useResetPassword() {
  const [mutate, state] = useResetPasswordMutation();
  const navigate = useNavigate();

  const resetPassword = useCallback(
    async (input: ResetPasswordRequest) => {
      try {
        const response = await mutate(input).unwrap();
        toast.success('Password updated', {
          description: 'You can now sign in with your new password.',
        });
        navigate('/auth/login', { replace: true });
        return { success: true as const, response };
      } catch (error) {
        const message = extractErrorMessage(error as never, 'Unable to reset password.');
        toast.error(message);
        return { success: false as const, message };
      }
    },
    [mutate, navigate],
  );

  return { resetPassword, isLoading: state.isLoading, error: state.error };
}
