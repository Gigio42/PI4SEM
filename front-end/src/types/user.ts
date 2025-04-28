export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  signupDate: string;
  initials?: string; // Iniciais do nome do usuário para exibição no avatar
  lastLogin?: string;
  subscription?: string;
}
