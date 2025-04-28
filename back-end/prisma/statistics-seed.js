// Seed para gerar dados estatísticos de teste
import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

async function generateTestStatistics() {
  try {
    console.log('Gerando dados estatísticos de teste...');
    
    // Obter todos os componentes
    const components = await prisma.component.findMany();
    if (components.length === 0) {
      console.log('Nenhum componente encontrado. Adicione componentes primeiro.');
      return;
    }
    
    // Obter todos os usuários
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.log('Nenhum usuário encontrado. Adicione usuários primeiro.');
      return;
    }
    
    // Gerar visualizações aleatórias de componentes para os últimos 30 dias
    const today = new Date();
    const componentViews = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Para cada dia, gerar entre 10 e 50 visualizações aleatórias
      const viewsCount = Math.floor(Math.random() * 40) + 10;
      
      for (let j = 0; j < viewsCount; j++) {
        const randomComponent = components[Math.floor(Math.random() * components.length)];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        componentViews.push({          componentId: randomComponent.id,
          userId: Math.random() > 0.3 ? randomUser.id : null, // 70% das visualizações têm usuário
          sessionId: `test-session-${Math.random().toString(36).substring(7)}`,
          timestamp: date,
        });
      }
    }
    
    // Inserir visualizações em lote
    await prisma.componentView.createMany({
      data: componentViews,
      skipDuplicates: true,
    });
    
    console.log(`Inseridas ${componentViews.length} visualizações de teste`);
    
    // Gerar estatísticas diárias para os últimos 30 dias
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
        // Valores fictícios para estatísticas
      const newUsers = Math.floor(Math.random() * 10) + 1;
      const activeUsers = Math.floor(Math.random() * 20) + 10;
      const totalSubscriptions = Math.floor((100 + i * 3 + newUsers) * (0.1 + Math.random() * 0.1)); // 10-20% de assinantes
      const totalRevenue = totalSubscriptions * (Math.random() * 20 + 30); // R$30-50 por assinatura
      const conversionRate = (totalSubscriptions / (100 + i * 3 + newUsers)) * 100;
      
      // Verificar se já existe estatística para esta data
      const existingStats = await prisma.statistics.findFirst({
        where: { date },
      });
      
      if (existingStats) {
        await prisma.statistics.update({
          where: { id: existingStats.id },          data: {
            newUsers,
            activeUsers,
            totalSubscriptions,
            revenue: totalRevenue,
            conversionRate,
          },
        });
      } else {
        await prisma.statistics.create({
          data: {
            date,
            newUsers,
            activeUsers,

            totalSubscriptions,
            revenue: totalRevenue,
            conversionRate,
          },
        });
      }
    }
    
    console.log('Dados estatísticos de teste gerados com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar dados estatísticos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
generateTestStatistics();
