export const JWT_USER_OPTIONS = Symbol('JWT_USER_OPTIONS');

export interface JwtUserOptions {
  secret: string;
  expiresIn?: string | number;
}
