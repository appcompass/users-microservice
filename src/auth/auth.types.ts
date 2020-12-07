export type DecodedToken = {
  id: number;
  permissions: string[];
  email: string;
  lastLogin: string;
  sub: number;
  iat: number;
  exp: number;
};
