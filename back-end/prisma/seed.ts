import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clean up existing data if needed
  await prisma.componentView.deleteMany({});
  await prisma.statistics.deleteMany({});
  await prisma.favorito.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.component.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.setting.deleteMany({});

  console.log('Database cleaned, starting seeding...');

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@uxperiment.com',
      password: adminPassword,
      name: 'Admin User',
      picture: 'https://randomuser.me/api/portraits/men/1.jpg',
      role: 'admin',
      lastLogin: new Date(),
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: userPassword,
        name: 'John Doe',
        picture: 'https://randomuser.me/api/portraits/men/2.jpg',
        role: 'user',
        lastLogin: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    }),
    prisma.user.create({
      data: {
        email: 'maria.silva@example.com',
        password: userPassword,
        name: 'Maria Silva',
        picture: 'https://randomuser.me/api/portraits/women/3.jpg',
        role: 'user',
        lastLogin: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    }),
    prisma.user.create({
      data: {
        email: 'alex.smith@example.com',
        password: userPassword,
        name: 'Alex Smith',
        picture: 'https://randomuser.me/api/portraits/men/4.jpg',
        role: 'user',
        lastLogin: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    }),
    prisma.user.create({
      data: {
        email: 'julia.costa@example.com',
        password: userPassword,
        name: 'Julia Costa',
        picture: 'https://randomuser.me/api/portraits/women/5.jpg',
        role: 'user',
        lastLogin: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    }),
    prisma.user.create({
      data: {
        email: 'david.wong@example.com',
        googleId: '107890123456789012345',
        name: 'David Wong',
        picture: 'https://randomuser.me/api/portraits/men/6.jpg',
        role: 'user',
        lastLogin: new Date(),
      },
    }),
  ]);

  console.log(`Created ${users.length + 1} users`);
  // Create Plans
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: 'Free',
        description: 'Basic access to components',
        price: new Prisma.Decimal(0),
        durationDays: 0, // Unlimited
        features: JSON.stringify([
          'Access to 5 basic components',
          'Limited downloads',
          'Community support',
        ]),
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Basic',
        description: 'Essential components for developers',
        price: new Prisma.Decimal(9.99),
        durationDays: 30,
        features: JSON.stringify([
          'Access to 20 components',
          'Download CSS and HTML code',
          'Email support',
          'Usage in personal projects',
        ]),
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Pro',
        description: 'Professional package for serious developers',
        price: new Prisma.Decimal(19.99),
        durationDays: 30,
        features: JSON.stringify([
          'Access to all components',
          'Download all code formats',
          'Priority email support',
          'Usage in commercial projects',
          'Premium components',
        ]),
        isActive: true,
        discount: 10, // 10% discount
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Enterprise',
        description: 'Complete solution for companies',
        price: new Prisma.Decimal(49.99),
        durationDays: 30,
        features: JSON.stringify([
          'Access to all components',
          'Custom component development',
          '24/7 priority support',
          'Team collaboration',
          'Commercial use with extended license',
          'API access',
        ]),
        isActive: true,
        discount: 15, // 15% discount
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Annual Pro',
        description: 'Annual subscription with great discount',
        price: new Prisma.Decimal(199.99),
        durationDays: 365,
        features: JSON.stringify([
          'All Pro features',
          '2 months free',
          'Annual billing',
        ]),
        isActive: true,
        discount: 20, // 20% discount
      },
    }),
  ]);

  console.log(`Created ${plans.length} plans`);

  // Create Subscriptions
  const currentDate = new Date();
  const subscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        startDate: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: 'ACTIVE',
        userId: users[0].id,
        planId: plans[2].id, // Pro plan
      },
    }),
    prisma.subscription.create({
      data: {
        startDate: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        endDate: new Date(currentDate.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        status: 'ACTIVE',
        userId: users[1].id,
        planId: plans[1].id, // Basic plan
      },
    }),
    prisma.subscription.create({
      data: {
        startDate: new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        endDate: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        status: 'EXPIRED',
        userId: users[2].id,
        planId: plans[1].id, // Basic plan
      },
    }),
    prisma.subscription.create({
      data: {
        startDate: new Date(currentDate.getTime() - 330 * 24 * 60 * 60 * 1000), // 330 days ago
        endDate: new Date(currentDate.getTime() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
        status: 'ACTIVE',
        userId: users[3].id,
        planId: plans[4].id, // Annual Pro plan
      },
    }),
    prisma.subscription.create({
      data: {
        startDate: new Date(currentDate.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        endDate: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'CANCELLED',
        cancelDate: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000), // Cancelled 10 days ago
        userId: users[4].id,
        planId: plans[3].id, // Enterprise plan
      },
    }),
  ]);

  console.log(`Created ${subscriptions.length} subscriptions`);
  // Create Payments
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        subscriptionId: subscriptions[0].id,
        amount: new Prisma.Decimal(19.99),
        status: 'COMPLETED',
        paymentMethod: 'CREDIT_CARD',
        transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
        paymentDate: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
    }),
    prisma.payment.create({
      data: {
        subscriptionId: subscriptions[1].id,
        amount: new Prisma.Decimal(9.99),
        status: 'COMPLETED',
        paymentMethod: 'PAYPAL',
        transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
        paymentDate: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
    }),
    prisma.payment.create({
      data: {
        subscriptionId: subscriptions[2].id,
        amount: new Prisma.Decimal(9.99),
        status: 'COMPLETED',
        paymentMethod: 'CREDIT_CARD',
        transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
        paymentDate: new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      },
    }),
    prisma.payment.create({
      data: {
        subscriptionId: subscriptions[3].id,
        amount: new Prisma.Decimal(199.99),
        status: 'COMPLETED',
        paymentMethod: 'CREDIT_CARD',
        transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
        paymentDate: new Date(currentDate.getTime() - 330 * 24 * 60 * 60 * 1000), // 330 days ago
      },
    }),
    prisma.payment.create({
      data: {
        subscriptionId: subscriptions[4].id,
        amount: new Prisma.Decimal(49.99),
        status: 'REFUNDED',
        paymentMethod: 'PAYPAL',
        transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
        paymentDate: new Date(currentDate.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      },
    }),
  ]);

  console.log(`Created ${payments.length} payments`);

  // Create Components
  const components = await Promise.all([
    // Buttons
    prisma.component.create({
      data: {
        name: 'Primary Button',
        cssContent: `.btn-primary {
  padding: 10px 20px;
  background-color: #3490dc;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background-color 0.3s;
  cursor: pointer;
}
.btn-primary:hover {
  background-color: #2779bd;
}`,
        htmlContent: '<button class="btn-primary">Click Me</button>',
        category: 'Buttons',
        color: '#3490dc',
      },
    }),
    prisma.component.create({
      data: {
        name: 'Outline Button',
        cssContent: `.btn-outline {
  padding: 10px 20px;
  background-color: transparent;
  color: #3490dc;
  border: 2px solid #3490dc;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;
}
.btn-outline:hover {
  background-color: #3490dc;
  color: white;
}`,
        htmlContent: '<button class="btn-outline">Click Me</button>',
        category: 'Buttons',
        color: '#3490dc',
      },
    }),
    prisma.component.create({
      data: {
        name: 'Danger Button',
        cssContent: `.btn-danger {
  padding: 10px 20px;
  background-color: #e3342f;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background-color 0.3s;
  cursor: pointer;
}
.btn-danger:hover {
  background-color: #cc1f1a;
}`,
        htmlContent: '<button class="btn-danger">Delete</button>',
        category: 'Buttons',
        color: '#e3342f',
      },
    }),
    
    // Cards
    prisma.component.create({
      data: {
        name: 'Simple Card',
        cssContent: `.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 300px;
}
.card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}
.card-content {
  color: #718096;
  line-height: 1.5;
}`,
        htmlContent: `<div class="card">
  <h3 class="card-title">Card Title</h3>
  <p class="card-content">This is a simple card component for displaying content.</p>
</div>`,
        category: 'Cards',
        color: '#4299e1',
      },
    }),
    prisma.component.create({
      data: {
        name: 'Profile Card',
        cssContent: `.profile-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 300px;
  text-align: center;
}
.profile-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 15px;
  border: 3px solid #4299e1;
}
.profile-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 5px;
}
.profile-title {
  color: #718096;
  margin-bottom: 15px;
}
.profile-bio {
  color: #4a5568;
  line-height: 1.5;
  margin-bottom: 15px;
}
.profile-social {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.profile-social-icon {
  color: #4299e1;
  font-size: 20px;
}`,
        htmlContent: `<div class="profile-card">
  <img src="https://randomuser.me/api/portraits/women/12.jpg" class="profile-image" alt="Profile Image">
  <h3 class="profile-name">Jane Doe</h3>
  <p class="profile-title">UX Designer</p>
  <p class="profile-bio">Passionate UX designer focused on creating intuitive interfaces for web and mobile applications.</p>
  <div class="profile-social">
    <a href="#" class="profile-social-icon"><i class="fab fa-twitter"></i></a>
    <a href="#" class="profile-social-icon"><i class="fab fa-linkedin"></i></a>
    <a href="#" class="profile-social-icon"><i class="fab fa-github"></i></a>
  </div>
</div>`,
        category: 'Cards',
        color: '#4299e1',
      },
    }),
    
    // Forms
    prisma.component.create({
      data: {
        name: 'Login Form',
        cssContent: `.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.form-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
  color: #2d3748;
}
.form-group {
  margin-bottom: 15px;
}
.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #4a5568;
}
.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}
.form-input:focus {
  border-color: #4299e1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}
.form-submit {
  width: 100%;
  padding: 12px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}
.form-submit:hover {
  background-color: #3182ce;
}
.form-footer {
  margin-top: 15px;
  text-align: center;
  color: #718096;
}
.form-link {
  color: #4299e1;
  text-decoration: none;
}
.form-link:hover {
  text-decoration: underline;
}`,
        htmlContent: `<form class="login-form">
  <h2 class="form-title">Login to Your Account</h2>
  <div class="form-group">
    <label for="email" class="form-label">Email</label>
    <input type="email" id="email" class="form-input" placeholder="your@email.com" required>
  </div>
  <div class="form-group">
    <label for="password" class="form-label">Password</label>
    <input type="password" id="password" class="form-input" placeholder="********" required>
  </div>
  <button type="submit" class="form-submit">Sign In</button>
  <p class="form-footer">Don't have an account? <a href="#" class="form-link">Sign up</a></p>
</form>`,
        category: 'Forms',
        color: '#4299e1',
      },
    }),
    
    // Navigation
    prisma.component.create({
      data: {
        name: 'Responsive Navbar',
        cssContent: `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.navbar-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  text-decoration: none;
}
.navbar-menu {
  display: flex;
  gap: 1.5rem;
  list-style-type: none;
}
.navbar-item {
  position: relative;
}
.navbar-link {
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  padding: 0.5rem 0;
}
.navbar-link:hover {
  color: #4299e1;
}
.navbar-link.active {
  color: #4299e1;
}
.navbar-link.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #4299e1;
}
.navbar-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #4a5568;
  cursor: pointer;
}
@media (max-width: 768px) {
  .navbar-toggle {
    display: block;
  }
  .navbar-menu {
    position: fixed;
    top: 0;
    right: -300px;
    width: 300px;
    height: 100vh;
    flex-direction: column;
    background-color: white;
    padding: 2rem;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    transition: right 0.3s;
    z-index: 999;
  }
  .navbar-menu.open {
    right: 0;
  }
  .navbar-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #4a5568;
    cursor: pointer;
  }
}`,
        htmlContent: `<nav class="navbar">
  <a href="#" class="navbar-logo">Logo</a>
  <button class="navbar-toggle">
    <i class="fas fa-bars"></i>
  </button>
  <ul class="navbar-menu">
    <button class="navbar-close">
      <i class="fas fa-times"></i>
    </button>
    <li class="navbar-item">
      <a href="#" class="navbar-link active">Home</a>
    </li>
    <li class="navbar-item">
      <a href="#" class="navbar-link">About</a>
    </li>
    <li class="navbar-item">
      <a href="#" class="navbar-link">Services</a>
    </li>
    <li class="navbar-item">
      <a href="#" class="navbar-link">Portfolio</a>
    </li>
    <li class="navbar-item">
      <a href="#" class="navbar-link">Contact</a>
    </li>
  </ul>
</nav>
<script>
  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbarMenu = document.querySelector('.navbar-menu');
  const navbarClose = document.querySelector('.navbar-close');

  navbarToggle.addEventListener('click', () => {
    navbarMenu.classList.add('open');
  });

  navbarClose.addEventListener('click', () => {
    navbarMenu.classList.remove('open');
  });
</script>`,
        category: 'Navigation',
        color: '#4299e1',
      },
    }),
    
    // Alerts
    prisma.component.create({
      data: {
        name: 'Alert Messages',
        cssContent: `.alert {
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  font-weight: 500;
}
.alert-success {
  background-color: #def7ec;
  color: #0f766e;
  border-left: 4px solid #10b981;
}
.alert-info {
  background-color: #e0f2fe;
  color: #0369a1;
  border-left: 4px solid #0ea5e9;
}
.alert-warning {
  background-color: #fef3c7;
  color: #92400e;
  border-left: 4px solid #f59e0b;
}
.alert-danger {
  background-color: #fee2e2;
  color: #b91c1c;
  border-left: 4px solid #ef4444;
}
.alert-icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}
.alert-content {
  flex: 1;
}
.alert-close {
  background: none;
  border: none;
  color: currentColor;
  opacity: 0.7;
  cursor: pointer;
  font-size: 1.25rem;
  transition: opacity 0.3s;
}
.alert-close:hover {
  opacity: 1;
}`,
        htmlContent: `<div class="alert alert-success">
  <div class="alert-icon">
    <i class="fas fa-check-circle"></i>
  </div>
  <div class="alert-content">
    Success! Your changes have been saved successfully.
  </div>
  <button class="alert-close">
    <i class="fas fa-times"></i>
  </button>
</div>

<div class="alert alert-info">
  <div class="alert-icon">
    <i class="fas fa-info-circle"></i>
  </div>
  <div class="alert-content">
    Info: Please review your information before proceeding.
  </div>
  <button class="alert-close">
    <i class="fas fa-times"></i>
  </button>
</div>

<div class="alert alert-warning">
  <div class="alert-icon">
    <i class="fas fa-exclamation-triangle"></i>
  </div>
  <div class="alert-content">
    Warning: Your subscription will expire in 3 days.
  </div>
  <button class="alert-close">
    <i class="fas fa-times"></i>
  </button>
</div>

<div class="alert alert-danger">
  <div class="alert-icon">
    <i class="fas fa-times-circle"></i>
  </div>
  <div class="alert-content">
    Error! There was a problem processing your request.
  </div>
  <button class="alert-close">
    <i class="fas fa-times"></i>
  </button>
</div>`,
        category: 'Alerts',
        color: '#ed8936',
      },
    }),
    
    // Modals
    prisma.component.create({
      data: {
        name: 'Modal Dialog',
        cssContent: `.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}
.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}
.modal {
  background-color: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: scale(0.8);
  transition: transform 0.3s;
}
.modal-overlay.active .modal {
  transform: scale(1);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}
.modal-close {
  background: none;
  border: none;
  color: #718096;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s;
}
.modal-close:hover {
  color: #4a5568;
}
.modal-body {
  padding: 1.5rem;
  color: #4a5568;
  line-height: 1.5;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}
.modal-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}
.modal-btn-secondary {
  background-color: white;
  color: #4a5568;
  border: 1px solid #cbd5e0;
}
.modal-btn-secondary:hover {
  background-color: #f7fafc;
}
.modal-btn-primary {
  background-color: #4299e1;
  color: white;
  border: 1px solid #4299e1;
}
.modal-btn-primary:hover {
  background-color: #3182ce;
  border-color: #3182ce;
}`,
        htmlContent: `<button id="open-modal" class="modal-btn modal-btn-primary">Open Modal</button>

<div class="modal-overlay" id="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title">Modal Title</h3>
      <button class="modal-close" id="close-modal">&times;</button>
    </div>
    <div class="modal-body">
      <p>This is a simple modal dialog component. You can use it to display important information or request user confirmation before proceeding with an action.</p>
    </div>
    <div class="modal-footer">
      <button class="modal-btn modal-btn-secondary" id="cancel-modal">Cancel</button>
      <button class="modal-btn modal-btn-primary">Confirm</button>
    </div>
  </div>
</div>

<script>
  const openModalBtn = document.getElementById('open-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const cancelModalBtn = document.getElementById('cancel-modal');
  const modalOverlay = document.getElementById('modal-overlay');

  openModalBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
  });

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);
  
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
</script>`,
        category: 'Modals',
        color: '#805ad5',
      },
    }),
    
    // Tables
    prisma.component.create({
      data: {
        name: 'Responsive Table',
        cssContent: `.table-container {
  width: 100%;
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.table th {
  background-color: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #e2e8f0;
}
.table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
}
.table tr:hover {
  background-color: #f7fafc;
}
.table-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.status-active {
  background-color: #def7ec;
  color: #0f766e;
}
.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}
.status-completed {
  background-color: #e0f2fe;
  color: #0369a1;
}
.status-cancelled {
  background-color: #fee2e2;
  color: #b91c1c;
}
.table-action {
  color: #4299e1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}
.table-action:hover {
  color: #3182ce;
  text-decoration: underline;
}`,
        htmlContent: `<div class="table-container">
  <table class="table">
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Email</th>
        <th>Status</th>
        <th>Date</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>John Doe</td>
        <td>john@example.com</td>
        <td><span class="table-status status-active">Active</span></td>
        <td>Apr 23, 2025</td>
        <td><a href="#" class="table-action">View</a></td>
      </tr>
      <tr>
        <td>2</td>
        <td>Jane Smith</td>
        <td>jane@example.com</td>
        <td><span class="table-status status-pending">Pending</span></td>
        <td>Apr 22, 2025</td>
        <td><a href="#" class="table-action">View</a></td>
      </tr>
      <tr>
        <td>3</td>
        <td>Robert Johnson</td>
        <td>robert@example.com</td>
        <td><span class="table-status status-completed">Completed</span></td>
        <td>Apr 21, 2025</td>
        <td><a href="#" class="table-action">View</a></td>
      </tr>
      <tr>
        <td>4</td>
        <td>Emily Davis</td>
        <td>emily@example.com</td>
        <td><span class="table-status status-cancelled">Cancelled</span></td>
        <td>Apr 20, 2025</td>
        <td><a href="#" class="table-action">View</a></td>
      </tr>
    </tbody>
  </table>
</div>`,
        category: 'Tables',
        color: '#3182ce',
      },
    }),
    
    // Loaders
    prisma.component.create({
      data: {
        name: 'Loading Spinners',
        cssContent: `.spinner-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}
.spinner {
  display: inline-block;
  position: relative;
  width: 40px;
  height: 40px;
}
.spinner-border {
  border-radius: 50%;
  border: 4px solid #e2e8f0;
  border-top-color: #4299e1;
  animation: spin 1s linear infinite;
}
.spinner-grow {
  background-color: #4299e1;
  border-radius: 50%;
  animation: grow 1s ease infinite;
}
.spinner-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}
.spinner-dot {
  width: 8px;
  height: 8px;
  background-color: #4299e1;
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}
.spinner-dot:nth-child(2) {
  animation-delay: 0.2s;
}
.spinner-dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes grow {
  0%, 100% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1); opacity: 1; }
}
@keyframes pulse {
  0%, 100% { transform: scale(0.5); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
}`,
        htmlContent: `<div class="spinner-container">
  <div class="spinner spinner-border"></div>
  
  <div class="spinner spinner-grow"></div>
  
  <div class="spinner spinner-dots">
    <div class="spinner-dot"></div>
    <div class="spinner-dot"></div>
    <div class="spinner-dot"></div>
  </div>
</div>`,
        category: 'Loaders',
        color: '#4299e1',
      },
    }),
    
    // Typography
    prisma.component.create({
      data: {
        name: 'Typography System',
        cssContent: `.typography {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #2d3748;
  max-width: 700px;
  margin: 0 auto;
}
.heading-1 {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}
.heading-2 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.25rem;
}
.heading-3 {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1rem;
}
.heading-4 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}
.text-lg {
  font-size: 1.125rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}
.text-base {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}
.text-sm {
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}
.text-xs {
  font-size: 0.75rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}
.text-muted {
  color: #718096;
}
.text-primary {
  color: #4299e1;
}
.text-success {
  color: #48bb78;
}
.text-warning {
  color: #ed8936;
}
.text-danger {
  color: #f56565;
}`,
        htmlContent: `<div class="typography">
  <h1 class="heading-1">Heading Level 1</h1>
  <h2 class="heading-2">Heading Level 2</h2>
  <h3 class="heading-3">Heading Level 3</h3>
  <h4 class="heading-4">Heading Level 4</h4>
  
  <p class="text-lg">This is large text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  <p class="text-base">This is base text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  <p class="text-sm">This is small text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  <p class="text-xs">This is extra small text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  
  <p class="text-base text-muted">This is muted text.</p>
  <p class="text-base text-primary">This is primary colored text.</p>
  <p class="text-base text-success">This is success colored text.</p>
  <p class="text-base text-warning">This is warning colored text.</p>
  <p class="text-base text-danger">This is danger colored text.</p>
</div>`,
        category: 'Typography',
        color: '#2d3748',
      },
    }),
  ]);

  console.log(`Created ${components.length} components`);

  // Create Favoritos
  const favoritos = await Promise.all([
    prisma.favorito.create({
      data: {
        userId: users[0].id,
        componentId: components[0].id,
      },
    }),
    prisma.favorito.create({
      data: {
        userId: users[0].id,
        componentId: components[3].id,
      },
    }),
    prisma.favorito.create({
      data: {
        userId: users[1].id,
        componentId: components[2].id,
      },
    }),
    prisma.favorito.create({
      data: {
        userId: users[1].id,
        componentId: components[5].id,
      },
    }),
    prisma.favorito.create({
      data: {
        userId: users[2].id,
        componentId: components[7].id,
      },
    }),
    prisma.favorito.create({
      data: {
        userId: users[3].id,
        componentId: components[9].id,
      },
    }),
  ]);

  console.log(`Created ${favoritos.length} favoritos`);
  // Create Component Views
  const twoWeeksAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);  // Function to create component views with random counts for each component
  const createComponentViews = async () => {
    const viewsData: Prisma.ComponentViewCreateManyInput[] = [];
    
    // For each component, create a random number of views
    for (const component of components) {
      const viewCount = Math.floor(Math.random() * 20) + 5; // 5 to 24 views per component
      
      // For each view, randomly assign to a user or anonymous session
      for (let i = 0; i < viewCount; i++) {
        const useUser = Math.random() > 0.3; // 70% chance of being a logged in user
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomDate = new Date(
          twoWeeksAgo.getTime() + Math.random() * (currentDate.getTime() - twoWeeksAgo.getTime())
        );
        
        viewsData.push({
            componentId: Number(component.id),
            userId: useUser ? Number(randomUser.id) : null,
            sessionId: !useUser ? `session_${Math.random().toString(36).substring(2, 15)}` : null,
            timestamp: randomDate,
          });
      }
    }
    
    // Bulk create the component views
    return await prisma.componentView.createMany({
      data: viewsData,
    });
  };
  
  const componentViewsResult = await createComponentViews();
  console.log(`Created ${componentViewsResult.count} component views`);  // Create Statistics
  const createStatistics = async () => {
    // Create statistics for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      // Create component views statistics
      const componentViewsStats = {};
      components.forEach(component => {
        componentViewsStats[component.id] = Math.floor(Math.random() * 30) + 1;
      });
      
      // Create page views statistics
      const pageViewsStats = {
        "/": Math.floor(Math.random() * 100) + 50,
        "/components": Math.floor(Math.random() * 80) + 30,
        "/pricing": Math.floor(Math.random() * 50) + 20,
        "/login": Math.floor(Math.random() * 40) + 10,
        "/register": Math.floor(Math.random() * 30) + 5,
        "/dashboard": Math.floor(Math.random() * 25) + 5,
      };
      
      // Create most viewed components statistics
      const mostViewedComponents = components.map(component => ({
        id: component.id,
        name: component.name,
        views: Math.floor(Math.random() * 100) + 1,
      })).sort((a, b) => b.views - a.views).slice(0, 5);
      
      // Create most favorited components statistics
      const mostFavoritedComponents = components.map(component => ({
        id: component.id,
        name: component.name,
        favorites: Math.floor(Math.random() * 20) + 1,
      })).sort((a, b) => b.favorites - a.favorites).slice(0, 5);
      
      await prisma.statistics.create({
        data: {
          date: date,
          componentViews: componentViewsStats as Prisma.JsonObject,
          pageViews: pageViewsStats as Prisma.JsonObject,
          newUsers: Math.floor(Math.random() * 10) + 1,
          activeUsers: Math.floor(Math.random() * 50) + 20,
          totalSubscriptions: Math.floor(Math.random() * 5) + i,
          revenue: new Prisma.Decimal(Math.random() * 500 + 100),
          mostViewedComponents: mostViewedComponents as unknown as Prisma.JsonArray,
          mostFavoritedComponents: mostFavoritedComponents as unknown as Prisma.JsonArray,
          conversionRate: new Prisma.Decimal(Math.random() * 10 + 1),
        },
      });
    }
    
    return await prisma.statistics.findMany();
  };
  
  const statisticsResult = await createStatistics();
  console.log(`Created ${statisticsResult.length} statistics records`);

  // Create Settings
  const settings = await Promise.all([
    prisma.setting.create({
      data: {
        section: 'app',
        key: 'name',
        value: 'UXperiment Components',
      },
    }),
    prisma.setting.create({
      data: {
        section: 'app',
        key: 'description',
        value: 'Uma plataforma para UX/UI designers e desenvolvedores encontrarem componentes reutilizáveis.',
      },
    }),
    prisma.setting.create({
      data: {
        section: 'email',
        key: 'from_email',
        value: 'no-reply@uxperiment.com',
      },
    }),
    prisma.setting.create({
      data: {
        section: 'email',
        key: 'smtp_host',
        value: 'smtp.example.com',
      },
    }),
    prisma.setting.create({
      data: {
        section: 'features',
        key: 'enable_social_login',
        value: 'true',
      },
    }),
    prisma.setting.create({
      data: {
        section: 'features',
        key: 'enable_dark_mode',
        value: 'true',
      },
    }),
  ]);

  console.log(`Created ${settings.length} settings`);

  console.log('Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
