import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useLogoutMutation } from '../api/authApi';
import { loggedOut } from '../model/authSlice';
import { selectRefreshToken } from '../model/selectors';

export function useLogout() {
  const [mutate, state] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const refreshToken = useAppSelector(selectRefreshToken);

  const logout = useCallback(async () => {
    try {
      if (refreshToken) await mutate({ refreshToken }).unwrap();
    } catch {
      // Server-side revocation is best-effort; we always clear locally.
    } finally {
      dispatch(loggedOut());
      toast.message('Signed out');
      navigate('/auth/login', { replace: true });
    }
  }, [dispatch, mutate, navigate, refreshToken]);

  return { logout, isLoading: state.isLoading };
}
