import { useEffect } from 'react';
import { useAuth } from './AuthContext';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  picture?: string;
};

export function BypassAuth() {
  const { login, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Somente executar bypass quando temos certeza que não há autenticação existente
    if (!isLoading && !isAuthenticated) {
      const bypassAuth = async () => {
        console.log("🔄 Executando BypassAuth para desenvolvimento");
        
        // Verificar se já existe um usuário no localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          console.log("✅ Usuário encontrado no localStorage, não é necessário bypass");
          return;
        }
        
        // Criar um usuário de desenvolvimento para testes
        const devUser: User = {
          id: 999,
          name: "Usuário Dev",
          email: "dev@exemplo.com",
          role: "admin", // Para testar funcionalidades de admin
        };
        
        console.log("🔑 Criando usuário de desenvolvimento para testes:", devUser);
        
        // Adicionar um atraso intencional para simular o tempo de login
        setTimeout(() => {
          login(devUser);
          localStorage.setItem('user', JSON.stringify(devUser));
          console.log("✅ Usuário de desenvolvimento logado com sucesso");
        }, 1000);
      };

      // Verificar se estamos em ambiente de desenvolvimento
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
        bypassAuth();
      }
    } else if (isAuthenticated) {
      console.log("✅ Usuário já autenticado, BypassAuth não é necessário");
    }
  }, [login, isAuthenticated, isLoading]);

  // Componente não renderiza nada
  return null;
}
