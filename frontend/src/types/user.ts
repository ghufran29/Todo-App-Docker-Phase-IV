import { UserRole } from './enums';

export interface UserBase {
  email: string;
  is_active?: boolean;
  email_verified?: boolean;
  role?: UserRole;
}

export interface User extends UserBase {
  id: string;
  created_at: string;
}

export interface UserCreate extends UserBase {
  password: string;
  confirm_password: string;
}

export interface UserUpdate {
  email?: string;
  is_active?: boolean;
  email_verified?: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  refresh_token: string;
  token_type: string;
}

// Alias for backward compatibility
export type UserPublic = User;