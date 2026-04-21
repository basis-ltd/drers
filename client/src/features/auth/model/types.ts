export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  surname: string;
  emailVerified: boolean;
  isActive: boolean;
}

export interface TenantRoleAssignment {
  tenantId: string;
  tenantCode?: string;
  tenantName?: string;
  roleId: string;
  roleName?: string;
  isPrimary: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresAt: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

export type RefreshResponse = LoginResponse;

export interface MessageResponse {
  message: string;
}

export interface MeResponse {
  user: AuthUser;
  roles: TenantRoleAssignment[];
}

export interface LoginRequest {
  email: string;
  password: string;
  keepSignedIn?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  surname: string;
  phone?: string;
  institutionalAffiliation?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}
