"use client";

import { useEffect, useState } from 'react';

export default function SetAdminUser() {
  const [isSet, setIsSet] = useState(false);

  useEffect(() => {
    // Verifica se já existe um usuário no localStorage
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      // Cria um usuário administrador de exemplo
      const adminUser = {
        id: 1,
        name: "Admin",
        email: "admin@uxperiment.com",
        role: "admin"
      };
      
      // Salva no localStorage
      localStorage.setItem('user', JSON.stringify(adminUser));
      setIsSet(true);
    } else {
      // Verifica se o usuário existente tem a role 'admin'
      const user = JSON.parse(userData);
      if (!user.role || user.role !== 'admin') {
        // Atualiza o usuário para ter a role 'admin'
        user.role = 'admin';
        localStorage.setItem('user', JSON.stringify(user));
        setIsSet(true);
      }
    }
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
}
