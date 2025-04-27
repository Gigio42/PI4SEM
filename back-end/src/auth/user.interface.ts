export interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
  picture?: string;
  googleId?: string;
  sub?: number; // For JWT payload compatibility
}
