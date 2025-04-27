import { Component } from '@/types/component';

export const mockComponents: Component[] = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
    name: 'Navigation Bar',
    category: 'Navigation',
    color: '#8B5CF6',
    cssContent: `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #8B5CF6;
  color: white;
}
.nav-brand {
  font-weight: 700;
  font-size: 1.5rem;
}
.nav-links {
  display: flex;
  gap: 1.5rem;
}
.nav-links a {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}
.nav-links a:hover {
  opacity: 0.8;
}`,
    htmlContent: '<nav class="navbar">\n  <div class="nav-brand">Brand</div>\n  <div class="nav-links">\n    <a href="#">Home</a>\n    <a href="#">About</a>\n    <a href="#">Services</a>\n    <a href="#">Contact</a>\n  </div>\n</nav>'
  }
];
