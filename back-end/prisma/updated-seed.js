const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seeding...');
    
    // Não limpar mais o banco de dados existente, apenas adicionar novos dados
    console.log('Adicionando novos dados sem limpar os existentes...');
    
    // Criar usuários apenas se não existirem
    const users = await createUsers();
    console.log(`Criados/verificados ${users.length} usuários`);
    
    // Criar planos apenas se não existirem
    const plans = await createPlans();
    console.log(`Criados/verificados ${plans.length} planos`);
    
    // Criar componentes apenas se não existirem
    const components = await createComponents();
    console.log(`Criados/verificados ${components.length} componentes`);
    
    // Criar configurações apenas se não existirem
    const settings = await createSettings();
    console.log(`Criadas/verificadas ${settings.length} configurações`);
    
    // Criar assinaturas de demonstração apenas para usuários sem assinatura
    const subscriptions = await createSubscriptions(users, plans);
    console.log(`Criadas ${subscriptions.length} assinaturas`);
    
    // Criar pagamentos para assinaturas novas
    if (subscriptions.length > 0) {
      const payments = await createPayments(subscriptions);
      console.log(`Criados ${payments.length} pagamentos`);
    }
    
    // Criar favoritos apenas se não existirem
    const favoritos = await createFavoritos(users, components);
    console.log(`Criados ${favoritos.length} favoritos`);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createUsers() {
  // Verificar usuários existentes
  const existingUsers = await prisma.user.findMany();
  console.log(`Usuários existentes: ${existingUsers.length}`);
  
  // Lista de usuários para criar se não existirem
  const usersToCreate = [
    {
      email: 'admin@uxperiment.com',
      password: '$2b$10$YeE5vy5Ka0QEHHO96uuc7cOYWt.WBCy.jkLLNogq1VXW2T1CGnXr/', // 'admin123'
      name: 'Admin User',
      role: 'admin',
      picture: 'https://ui-avatars.com/api/?name=Admin+User'
    },
    {
      email: 'user@example.com',
      password: '$2b$10$owq2iiUQJOkIuAR.AKeFO.2SeYJPV5hbW85Oj0OCR5SdOrgO46IqS', // 'password123'
      name: 'John Doe',
      role: 'user',
      picture: 'https://ui-avatars.com/api/?name=John+Doe'
    },
    {
      email: 'designer@example.com',
      password: '$2b$10$owq2iiUQJOkIuAR.AKeFO.2SeYJPV5hbW85Oj0OCR5SdOrgO46IqS', // 'password123'
      name: 'Jane Smith',
      role: 'user',
      picture: 'https://ui-avatars.com/api/?name=Jane+Smith'
    },
    {
      email: 'google_user@gmail.com',
      googleId: '106156614954794924868',
      name: 'Google User',
      role: 'user',
      picture: 'https://ui-avatars.com/api/?name=Google+User'
    }
  ];
  
  // Criar apenas usuários que não existem
  for (const userData of usersToCreate) {
    const existingUser = existingUsers.find(user => user.email === userData.email);
    if (!existingUser) {
      console.log(`Criando usuário: ${userData.email}`);
      await prisma.user.create({ data: userData });
    } else {
      console.log(`Usuário já existe: ${userData.email}`);
    }
  }
  
  return await prisma.user.findMany();
}

async function createPlans() {
  // Verificar planos existentes
  const existingPlans = await prisma.plan.findMany();
  console.log(`Planos existentes: ${existingPlans.length}`);
  
  // Lista de planos para criar se não existirem
  const plansToCreate = [
    {
      name: 'Free',
      description: 'Access to basic components',
      price: 0,
      durationDays: 30,
      features: JSON.stringify(['Access to 10 basic components', 'PDF documentation', 'Community support']),
      isActive: true
    },
    {
      name: 'Pro',
      description: 'Unlimited access to all components',
      price: 29.99,
      durationDays: 30,
      features: JSON.stringify(['Access to all components', 'Premium support', 'Source files', 'Monthly updates']),
      isActive: true
    },
    {
      name: 'Enterprise',
      description: 'Full access with team collaboration',
      price: 99.99,
      durationDays: 30,
      features: JSON.stringify(['Everything in Pro', 'Team management', 'API access', 'Custom components', 'Priority support']),
      isActive: true
    },
    {
      name: 'Annual Pro',
      description: 'Yearly subscription with discount',
      price: 299.99,
      durationDays: 365,
      features: JSON.stringify(['Everything in Pro', '25% discount', 'Priority support']),
      isActive: true
    }
  ];
  
  // Criar apenas planos que não existem (baseado no nome do plano)
  for (const planData of plansToCreate) {
    const existingPlan = existingPlans.find(plan => plan.name === planData.name);
    if (!existingPlan) {
      console.log(`Criando plano: ${planData.name}`);
      await prisma.plan.create({ data: planData });
    } else {
      console.log(`Plano já existe: ${planData.name}`);
    }
  }
  
  return await prisma.plan.findMany();
}

async function createComponents() {
  // Verificar componentes existentes
  const existingComponents = await prisma.component.findMany();
  console.log(`Componentes existentes: ${existingComponents.length}`);
  
  // Lista de componentes para criar se não existirem
  const componentsToCreate = [
    {
      name: 'Button Primary',
      category: 'Buttons',
      color: '#3B82F6',
      cssContent: `.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: #3B82F6;
  color: white;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-primary:hover {
  background-color: #2563EB;
}`,
      htmlContent: '<button class="btn-primary">Click me</button>'
    },
    {
      name: 'Card Basic',
      category: 'Cards',
      color: '#6366F1',
      cssContent: `.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}
.card-body {
  color: #4B5563;
}`,
      htmlContent: '<div class="card">\n  <h2 class="card-title">Card Title</h2>\n  <p class="card-body">This is a basic card component with some content.</p>\n</div>'
    },
    {
      name: 'Alert Info',
      category: 'Alerts',
      color: '#60A5FA',
      cssContent: `.alert-info {
  background-color: #EFF6FF;
  border-left: 4px solid #3B82F6;
  color: #1E40AF;
  padding: 1rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
}
.alert-info svg {
  width: 1.5rem;
  height: 1.5rem;
}`,
      htmlContent: '<div class="alert-info">\n  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">\n    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />\n  </svg>\n  <span>This is an informational alert message.</span>\n</div>'
    },
    {
      name: 'Navbar Simple',
      category: 'Navigation',
      color: '#1F2937',
      cssContent: `.navbar {
  background: #1F2937;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.navbar-brand {
  font-weight: bold;
  font-size: 1.25rem;
}
.navbar-links {
  display: flex;
  gap: 1.5rem;
}
.navbar-links a {
  color: #E5E7EB;
  text-decoration: none;
  transition: color 0.2s;
}
.navbar-links a:hover {
  color: white;
}`,
      htmlContent: '<nav class="navbar">\n  <div class="navbar-brand">UXperiment</div>\n  <div class="navbar-links">\n    <a href="#">Home</a>\n    <a href="#">Features</a>\n    <a href="#">Pricing</a>\n    <a href="#">Contact</a>\n  </div>\n</nav>'
    },
    {
      name: 'Form Input',
      category: 'Forms',
      color: '#8B5CF6',
      cssContent: `.form-group {
  margin-bottom: 1rem;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4B5563;
}
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.15s;
}
.form-input:focus {
  border-color: #8B5CF6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}`,
      htmlContent: '<div class="form-group">\n  <label class="form-label" for="username">Username</label>\n  <input class="form-input" id="username" type="text" placeholder="Enter your username">\n</div>'
    }
  ];
  
  // Criar apenas componentes que não existem (baseado no nome do componente)
  for (const componentData of componentsToCreate) {
    const existingComponent = existingComponents.find(comp => comp.name === componentData.name);
    if (!existingComponent) {
      console.log(`Criando componente: ${componentData.name}`);
      await prisma.component.create({ data: componentData });
    } else {
      console.log(`Componente já existe: ${componentData.name}`);
    }
  }
  
  return await prisma.component.findMany();
}

async function createSettings() {
  // Verificar configurações existentes
  const existingSettings = await prisma.setting.findMany();
  console.log(`Configurações existentes: ${existingSettings.length}`);
  
  // Lista de configurações para criar se não existirem
  const settingsToCreate = [
    {
      section: 'general',
      key: 'site_name',
      value: 'UXperiment Labs'
    },
    {
      section: 'general',
      key: 'site_description',
      value: 'Component library for modern web development'
    },
    {
      section: 'email',
      key: 'contact_email',
      value: 'support@uxperiment.com'
    },
    {
      section: 'subscription',
      key: 'free_trial_days',
      value: '14'
    },
    {
      section: 'appearance',
      key: 'primary_color',
      value: '#6366F1'
    },
    {
      section: 'appearance',
      key: 'dark_mode',
      value: 'false'
    }
  ];
  
  // Criar apenas configurações que não existem (baseado na combinação de section e key)
  for (const settingData of settingsToCreate) {
    const existingSetting = existingSettings.find(
      setting => setting.section === settingData.section && setting.key === settingData.key
    );
    
    if (!existingSetting) {
      console.log(`Criando configuração: ${settingData.section}.${settingData.key}`);
      await prisma.setting.create({ data: settingData });
    } else {
      console.log(`Configuração já existe: ${settingData.section}.${settingData.key}`);
    }
  }
  
  return await prisma.setting.findMany();
}

async function createSubscriptions(users, plans) {
  // Verificar assinaturas existentes para evitar duplicatas
  const existingSubscriptions = await prisma.subscription.findMany({
    include: { user: true }
  });
  
  // Lista de assinaturas a serem criadas
  const subscriptionsToCreate = [];
  const now = new Date();
  
  // Verificar quais usuários já possuem assinaturas
  const usersWithSubscription = new Set(existingSubscriptions.map(sub => sub.userId));
  
  // Para cada usuário sem assinatura, criar uma assinatura de teste
  for (const user of users) {
    if (!usersWithSubscription.has(user.id)) {
      // Escolher um plano baseado no tipo de usuário
      let planId;
      let subscriptionStatus = 'ACTIVE'; // Status padrão
      
      if (user.role === 'admin') {
        // Admin terá plano Pro
        planId = plans.find(p => p.name === 'Pro')?.id;
      } else if (user.email === 'designer@example.com') {
        // Designer terá plano Annual Pro
        planId = plans.find(p => p.name === 'Annual Pro')?.id;
      } else {
        // Outros usuários terão plano Free
        planId = plans.find(p => p.name === 'Free')?.id;
      }
      
      // Se o plano foi encontrado, criar a assinatura
      if (planId) {
        const plan = plans.find(p => p.id === planId);
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + plan.durationDays);
        
        subscriptionsToCreate.push({
          startDate: now,
          endDate,
          status: subscriptionStatus,
          userId: user.id,
          planId
        });
      }
    }
  }
  
  // Criar assinaturas para usuários sem assinatura
  const createdSubscriptions = [];
  for (const subData of subscriptionsToCreate) {
    console.log(`Criando assinatura para usuário ${subData.userId}, plano ${subData.planId}`);
    const subscription = await prisma.subscription.create({ data: subData });
    createdSubscriptions.push(subscription);
  }
  
  return createdSubscriptions;
}

async function createPayments(subscriptions) {
  const now = new Date();
  
  // Filtrar assinaturas pagas
  const paidSubscriptions = subscriptions.filter(sub => sub.type !== 'free');
  
  const paymentData = paidSubscriptions.map(sub => {
    return {
      subscriptionId: sub.id,
      amount: sub.type === 'monthly' ? 29.99 : 299.99,
      status: 'completed',
      paymentMethod: sub.paymentMethod || 'credit_card',
      transactionId: `txn_${Math.random().toString(36).substring(2, 12)}`,
      paymentDate: now
    };
  });
  
  const createdPayments = [];
  for (const payment of paymentData) {
    console.log(`Criando pagamento para assinatura ${payment.subscriptionId}`);
    const result = await prisma.payment.create({ data: payment });
    createdPayments.push(result);
  }
  
  return createdPayments;
}

async function createFavoritos(users, components) {
  try {
    // Verificar favoritos existentes
    const existingFavoritos = await prisma.favorito.findMany();
    console.log(`Favoritos existentes: ${existingFavoritos.length}`);
    
    // Estrutura para rastrear relações usuário-componente já existentes
    const existingRelations = new Set(
      existingFavoritos.map(fav => `${fav.userId}-${fav.componentId}`)
    );
    
    // Lista para armazenar os dados dos novos favoritos
    const favoritosToCreate = [];
    
    // Verifique usuários e componentes disponíveis
    if (!users || users.length === 0 || !components || components.length === 0) {
      console.warn('Sem usuários ou componentes suficientes para criar favoritos');
      return [];
    }
    
    // Criar relações usuário-componente que ainda não existem
    const potentialFavorites = [
      // Admin favorita o primeiro componente
      { userId: users.find(u => u.role === 'admin')?.id, componentId: components[0]?.id },
      
      // Usuário regular favorita o segundo componente
      { userId: users.find(u => u.email === 'user@example.com')?.id, componentId: components[1]?.id },
      
      // Designer favorita componentes de cards, alerts e forms
      { userId: users.find(u => u.email === 'designer@example.com')?.id, componentId: components.find(c => c.category === 'Cards')?.id },
      { userId: users.find(u => u.email === 'designer@example.com')?.id, componentId: components.find(c => c.category === 'Alerts')?.id },
      { userId: users.find(u => u.email === 'designer@example.com')?.id, componentId: components.find(c => c.category === 'Forms')?.id }
    ];
    
    // Filtrar relações válidas e que ainda não existem
    for (const fav of potentialFavorites) {
      if (fav.userId && fav.componentId) {
        const relationKey = `${fav.userId}-${fav.componentId}`;
        if (!existingRelations.has(relationKey)) {
          favoritosToCreate.push(fav);
        }
      }
    }
    
    console.log(`Criando ${favoritosToCreate.length} novos favoritos`);
    
    // Criar os novos favoritos
    const createdFavoritos = [];
    for (const fav of favoritosToCreate) {
      console.log(`Criando favorito: usuário ${fav.userId} - componente ${fav.componentId}`);
      const result = await prisma.favorito.create({ data: fav });
      createdFavoritos.push(result);
    }
    
    return createdFavoritos;
  } catch (error) {
    console.error('Erro ao criar favoritos:', error);
    return [];
  }
}

// Execute the seed function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
