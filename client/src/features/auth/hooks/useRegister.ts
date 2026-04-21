import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useRegisterMutation } from '../api/authApi';
import type { RegisterRequest } from '../model/types';
import { extractErrorMessage } from './errorMessage';

export function useRegister() {
  const [registerMutation, state] = useRegisterMutation();
  const navigate = useNavigate();

  const register = useCallback(
    async (input: RegisterRequest) => {
      try {
        const response = await registerMutation(input).unwrap();
        toast.success('Account created', {
          description: 'Check your inbox to verify your email before signing in.',
        });
        navigate(`/auth/verify?email=${encodeURIComponent(input.email)}`, { replace: true });
        return { success: true as const, response };
      } catch (error) {
        const message = extractErrorMessage(error as never, 'Unable to register.');
        toast.error(message);
        return { success: false as const, message };
      }
    },
    [navigate, registerMutation],
  );

  return { register, isLoading: state.isLoading, error: state.error };
}
