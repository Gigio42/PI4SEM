const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seeding...');
    
    // Clear all existing data in the correct order to respect foreign key constraints
    console.log('Clearing existing data...');
    await clearDatabase();
    
    // Create users
    const users = await createUsers();
    console.log(`Created ${users.length} users`);
    
    // Create plans
    const plans = await createPlans();
    console.log(`Created ${plans.length} plans`);
    
    // Create subscriptions
    const subscriptions = await createSubscriptions(users, plans);
    console.log(`Created ${subscriptions.length} subscriptions`);
    
    // Create payments
    const payments = await createPayments(subscriptions);
    console.log(`Created ${payments.length} payments`);
    
    // Create components
    const components = await createComponents();
    console.log(`Created ${components.length} components`);
    
    // Create settings
    const settings = await createSettings();
    console.log(`Created ${settings.length} settings`);
    
    // Create favoritos (bookmarks)
    const favoritos = await createFavoritos(users, components);
    console.log(`Created ${favoritos.length} favoritos`);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Clear database in the correct order to respect foreign key constraints
async function clearDatabase() {
  // Delete in reverse order of dependencies
  await prisma.payment.deleteMany({});
  await prisma.favorito.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.component.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.setting.deleteMany({});
}

async function createUsers() {
  // First delete all existing users to ensure clean state
  await prisma.user.deleteMany({});
  
  return await prisma.user.createMany({
    data: [
      {
        id: 1, // Explicitly set id to 1 for the admin user
        email: 'admin@uxperiment.com',
        password: '$2b$10$YeE5vy5Ka0QEHHO96uuc7cOYWt.WBCy.jkLLNogq1VXW2T1CGnXr/', // 'admin123'
        name: 'Admin User',
        role: 'admin',
        picture: 'https://ui-avatars.com/api/?name=Admin+User'
      },
      {
        id: 2, // Explicitly set id to 2 for this user
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
    ]
  }).then(() => prisma.user.findMany());
}

async function createPlans() {
  return await prisma.plan.createMany({
    data: [
      {
        name: 'Free',
        description: 'Access to basic components',
        price: 0,
        durationDays: 30, // Changed from duration to durationDays
        features: JSON.stringify(['Access to 10 basic components', 'PDF documentation', 'Community support']),
        isActive: true // Changed from active to isActive
      },
      {
        name: 'Pro',
        description: 'Unlimited access to all components',
        price: 29.99,
        durationDays: 30, // Changed from duration to durationDays
        features: JSON.stringify(['Access to all components', 'Premium support', 'Source files', 'Monthly updates']),
        isActive: true // Changed from active to isActive
      },
      {
        name: 'Enterprise',
        description: 'Full access with team collaboration',
        price: 99.99,
        durationDays: 30, // Changed from duration to durationDays
        features: JSON.stringify(['Everything in Pro', 'Team management', 'API access', 'Custom components', 'Priority support']),
        isActive: true // Changed from active to isActive
      },
      {
        name: 'Annual Pro',
        description: 'Yearly subscription with discount',
        price: 299.99,
        durationDays: 365, // Changed from duration to durationDays
        features: JSON.stringify(['Everything in Pro', '25% discount', 'Priority support']),
        isActive: true // Changed from active to isActive
      }
    ]
  }).then(() => prisma.plan.findMany());
}

async function createSubscriptions(users, plans) {
  const now = new Date();
  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  
  const oneYearLater = new Date(now);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  
  return await prisma.subscription.createMany({
    data: [
      {
        type: 'monthly',
        startDate: now,
        endDate: oneMonthLater,
        status: true,
        userId: users[0].id,
        planId: plans[1].id,
        paymentMethod: 'credit_card',
        paymentStatus: 'completed',
        nextPaymentDate: oneMonthLater
      },
      {
        type: 'free',
        startDate: now,
        endDate: oneMonthLater,
        status: true,
        userId: users[1].id,
        planId: plans[0].id,
        paymentMethod: null,
        paymentStatus: null,
        nextPaymentDate: null
      },
      {
        type: 'yearly',
        startDate: now,
        endDate: oneYearLater,
        status: true,
        userId: users[2].id,
        planId: plans[3].id,
        paymentMethod: 'paypal',
        paymentStatus: 'completed',
        nextPaymentDate: oneYearLater
      }
    ]
  }).then(() => prisma.subscription.findMany());
}

async function createPayments(subscriptions) {
  const now = new Date();
  
  // Filter out free subscriptions
  const paidSubscriptions = subscriptions.filter(sub => sub.paymentStatus === 'completed');
  
  const paymentData = paidSubscriptions.map(sub => {
    return {
      subscriptionId: sub.id,
      amount: sub.type === 'monthly' ? 29.99 : 299.99,
      status: 'completed',
      paymentMethod: sub.paymentMethod,
      transactionId: `txn_${Math.random().toString(36).substring(2, 12)}`,
      paymentDate: now
    };
  });
  
  return await prisma.payment.createMany({
    data: paymentData
  }).then(() => prisma.payment.findMany());
}

async function createComponents() {
  return await prisma.component.createMany({
    data: [
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
    ]
  }).then(() => prisma.component.findMany());
}

async function createSettings() {
  return await prisma.setting.createMany({
    data: [
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
    ]
  }).then(() => prisma.setting.findMany());
}

async function createFavoritos(users, components) {
  try {
    // First clear any existing favorites
    await prisma.favorito.deleteMany({});
    
    // Validate that we have users and components before creating favorites
    if (!users || users.length === 0) {
      console.warn('No users found, skipping favorites creation');
      return [];
    }
    
    if (!components || components.length === 0) {
      console.warn('No components found, skipping favorites creation');
      return [];
    }
    
    // Log available user and component IDs for debugging
    console.log('Available users for favorites:', users.map(u => ({ id: u.id, name: u.name })));
    console.log('Available components for favorites:', components.map(c => ({ id: c.id, name: c.name })));
    
    // Make sure we have at least one favorite for user 1 and 2
    const favoritosData = [];
    
    // Verify user 1 exists before adding
    const user1 = users.find(u => u.id === 1);
    if (user1 && components.length > 0) {
      favoritosData.push({
        userId: 1, // Admin user
        componentId: components[0].id // First component
      });
    }
    
    // Verify user 2 exists before adding
    const user2 = users.find(u => u.id === 2);
    if (user2 && components.length > 1) {
      favoritosData.push({
        userId: 2, // Regular user
        componentId: components[1].id // Second component 
      });
    }
    
    // Add the rest of the favorites if we have enough users and components
    if (users.length > 2 && components.length > 4) {
      // Use existing user IDs rather than array indices
      const user1Id = users[0].id;
      const user2Id = users[1].id;
      const user3Id = users[2].id;
      
      favoritosData.push(
        {
          userId: user1Id,
          componentId: components[0].id
        },
        {
          userId: user2Id,
          componentId: components[2].id
        },
        {
          userId: user3Id,
          componentId: components[1].id
        },
        {
          userId: user3Id,
          componentId: components[3].id
        }
      );
      
      // Only add this if we have enough components
      if (components.length > 4) {
        favoritosData.push({
          userId: user3Id,
          componentId: components[4].id
        });
      }
    }
    
    console.log(`Creating ${favoritosData.length} favorites with data:`, JSON.stringify(favoritosData, null, 2));
    
    // Create the favorites
    const result = await prisma.favorito.createMany({
      data: favoritosData
    });
    
    console.log(`Created ${result.count} favorites successfully`);
    
    // Return all created favorites
    return await prisma.favorito.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        component: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating favorites:', error);
    return [];
  }
}

// Execute the seed function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });