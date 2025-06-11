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
      console.log('Buscando usuários do backend...');
      
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        const status = response.status;
        console.warn(`Falha ao buscar usuários. Status: ${status}`);
        
        if (status === 401) {
          console.warn('Erro de autenticação. Verifique se o token está disponível e válido.');
        }
        
        // Se estamos em desenvolvimento e há erro de auth, usa dados mockados
        if (process.env.NODE_ENV === 'development' && status === 401) {
          console.info('Usando dados simulados para desenvolvimento');
          return this.getMockUsers();
        }
        
        throw new Error(`Falha ao buscar usuários (${status})`);
      }

      const users = await response.json();
      console.log(`${users.length} usuários carregados do backend`);
      return users;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      
      // Em caso de erro de rede, retorna dados simulados apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('Usando dados simulados devido ao erro');
        return this.getMockUsers();
      }
      
      throw error;
    }
  }

  /**
   * Retorna dados simulados de usuários para desenvolvimento
   */
  private static getMockUsers(): User[] {
    console.log('Usando usuários simulados');
    return [
      {
        id: '1',
        name: 'Maria Silva',
        email: 'maria.silva@example.com',
        role: 'user',
        status: 'active',
        signupDate: new Date().toISOString(),
        initials: 'MS'
      },
      {
        id: '2',
        name: 'João Costa',
        email: 'joao.costa@example.com',
        role: 'admin',
        status: 'active',
        signupDate: new Date().toISOString(),
        initials: 'JC'
      },
      {
        id: '3',
        name: 'Ana Oliveira',
        email: 'ana.oliveira@example.com',
        role: 'user',
        status: 'inactive',
        signupDate: new Date().toISOString(),
        initials: 'AO'
      },
      {
        id: '4',
        name: 'Carlos Santos',
        email: 'carlos.santos@example.com',
        role: 'user',
        status: 'active',
        signupDate: new Date().toISOString(),
        initials: 'CS'
      }
    ];
  }

  /**
   * Atualiza o papel (role) de um usuário
   * @param userId ID do usuário
   * @param role Novo papel (role) do usuário
   * @returns Usuário atualizado
   */
  static async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User> {
    try {
      console.log(`Atualizando papel do usuário ${userId} para ${role}...`);
      
      const response = await fetch(`${this.baseUrl}/users/${userId}/role`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar papel do usuário: ${response.status}`);
      }

      const updatedUser = await response.json();
      console.log('Papel do usuário atualizado com sucesso');
      return updatedUser;
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
      console.log(`Atualizando status do usuário ${userId} para ${status}...`);
      
      const response = await fetch(`${this.baseUrl}/users/${userId}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar status do usuário: ${response.status}`);
      }

      const updatedUser = await response.json();
      console.log('Status do usuário atualizado com sucesso');
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      throw error;
    }
  }
}

export { UsersService };
