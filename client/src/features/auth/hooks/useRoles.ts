import { useMemo } from 'react';
import { useMeQuery } from '@/features/auth/api/authApi';

export type RoleName =
  | 'APPLICANT'
  | 'REVIEWER'
  | 'IRB_ADMIN'
  | 'RNEC_ADMIN'
  | 'FINANCE'
  | 'CHAIRPERSON'
  | 'SYS_ADMIN';

export interface UseRolesResult {
  userId: string | null;
  roles: RoleName[];
  isLoading: boolean;
  hasRole: (role: RoleName) => boolean;
  hasAnyRole: (roles: RoleName[]) => boolean;
  isStaff: boolean;
  isChairperson: boolean;
  isReviewer: boolean;
  isAdmin: boolean;
}

const ADMIN_ROLES: RoleName[] = ['RNEC_ADMIN', 'IRB_ADMIN', 'SYS_ADMIN'];

export function useRoles(): UseRolesResult {
  const { data, isLoading } = useMeQuery();

  return useMemo(() => {
    const roles = (data?.roles ?? [])
      .map((r) => r.roleName as RoleName | undefined)
      .filter((r): r is RoleName => Boolean(r));
    const hasRole = (role: RoleName) => roles.includes(role);
    const hasAnyRole = (rs: RoleName[]) => rs.some((r) => roles.includes(r));
    const isAdmin = hasAnyRole(ADMIN_ROLES);
    const isStaff = roles.some((r) => r !== 'APPLICANT');
    return {
      userId: data?.user?.id ?? null,
      roles,
      isLoading,
      hasRole,
      hasAnyRole,
      isStaff,
      isChairperson: hasRole('CHAIRPERSON'),
      isReviewer: hasRole('REVIEWER'),
      isAdmin,
    };
  }, [data, isLoading]);
}
