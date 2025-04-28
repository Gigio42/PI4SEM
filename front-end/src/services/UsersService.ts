import { User } from "@/types/user";

class UsersService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  private static getHeaders() {
    // Obter o token do localStorage, se disponível
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }
  
  /**
   * Obtém estatísticas dos usuários
   * @returns Objeto com estatísticas dos usuários
   */
  static async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    admins: number;
    newUsersThisMonth: number;
  }> {
    try {
      console.log('Tentando buscar estatísticas de usuários...');
      
      const response = await fetch(`${this.baseUrl}/users/stats`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include', // Adiciona cookies na requisição, importante para autenticação
      });

      if (!response.ok) {
        const status = response.status;
        console.warn(`Falha ao buscar estatísticas de usuários. Status: ${status}`);
        
        if (status === 401) {
          console.warn('Erro de autenticação. Verifique se o token está disponível e válido.');
          // Se estamos em desenvolvimento, usamos dados mockados
          if (process.env.NODE_ENV === 'development') {
            console.info('Usando dados simulados para desenvolvimento');
            return this.getMockUserStats();
          }
        }
        
        throw new Error(`Falha ao buscar estatísticas de usuários (${status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Retorna dados simulados em caso de erro
      return this.getMockUserStats();
    }
  }
  
  /**
   * Retorna dados simulados de estatísticas para desenvolvimento
   */
  private static getMockUserStats(): {
    totalUsers: number;
    activeUsers: number;
    admins: number;
    newUsersThisMonth: number;
  } {
    console.log('Usando estatísticas simuladas');
    return {
      totalUsers: 42,
      activeUsers: 36,
      admins: 3,
      newUsersThisMonth: 7
    };
  }

  /**
   * Busca todos os usuários do sistema
   * @returns Lista de usuários
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      // Simulação temporária até que o endpoint de listagem de usuários esteja disponível no backend
      console.log('Buscando usuários do backend...');
      
      // Dados simulados para desenvolvimento
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Maria Silva',
          email: 'maria.silva@example.com',
          role: 'user',
          status: 'active',
          signupDate: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'João Costa',
          email: 'joao.costa@example.com',
          role: 'admin',
          status: 'active',
          signupDate: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Ana Oliveira',
          email: 'ana.oliveira@example.com',
          role: 'user',
          status: 'inactive',
          signupDate: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Carlos Santos',
          email: 'carlos.santos@example.com',
          role: 'user',
          status: 'active',
          signupDate: new Date().toISOString(),
        }
      ];
      
      return Promise.resolve(mockUsers);
      
      // Código original - comentado até o endpoint estar disponível
      /*
      const response = await fetch(`${this.baseUrl}/users`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar usuários: ${response.status}`);
      }

      return await response.json();
      */
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }
  /**
   * Atualiza o papel (role) de um usuário
   * @param userId ID do usuário
   * @param role Novo papel (role) do usuário
   * @returns Usuário atualizado
   */
  static async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User> {
    try {
      // Simulação temporária até que o endpoint esteja disponível no backend
      console.log(`Atualizando papel do usuário ${userId} para ${role}...`);
      
      // Simula tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Retorna um objeto simulando o usuário atualizado
      return Promise.resolve({
        id: userId,
        name: 'Nome Simulado', // Na prática, este valor viria da resposta da API
        email: 'email@simulado.com',
        role: role, // Usa o novo papel que foi passado
        status: 'active',
        signupDate: new Date().toISOString()
      });
      
      // Código original - comentado até o endpoint estar disponível
      /*
      const response = await fetch(`${this.baseUrl}/users/${userId}/role`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar papel do usuário: ${response.status}`);
      }

      return await response.json();
      */
    } catch (error) {
      console.error('Erro ao atualizar papel do usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza o status de um usuário (ativo/inativo)
   * @param userId ID do usuário
   * @param status Novo status do usuário
   * @returns Usuário atualizado
   */
  static async updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar status do usuário: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      throw error;
    }
  }
}

export { UsersService };
