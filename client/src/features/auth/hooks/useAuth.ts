import { useAppSelector } from '@/app/hooks';
import {
  selectAccessToken,
  selectAuthUser,
  selectIsAuthenticated,
  selectIsEmailVerified,
} from '../model/selectors';

export function useAuth() {
  const user = useAppSelector(selectAuthUser);
  const accessToken = useAppSelector(selectAccessToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isEmailVerified = useAppSelector(selectIsEmailVerified);
  return { user, accessToken, isAuthenticated, isEmailVerified };
}
