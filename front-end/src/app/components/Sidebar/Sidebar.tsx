"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import { useState, useEffect, ReactNode } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Plan, Subscription } from '@/types/subscription';
import { SubscriptionService } from '@/services/SubscriptionService';

// Defining the navigation item type
export interface NavItem {
  name: string;
  icon: ReactNode;
  href: string;
  highlight?: boolean; // For highlighting important items
  badge?: string | number; // For showing notifications or counters
  alwaysActive?: boolean; // To keep an item always active
}

// Modular Sidebar component that accepts different navigation items based on user type
interface SidebarProps {
  items?: NavItem[];
  isAdmin?: boolean;
  onToggle?: (collapsed: boolean) => void;
  onCollapseChange?: (collapsed: boolean) => void; // Add onCollapseChange prop to Sidebar component
}

// Default navigation items for regular users
const userNavItems: NavItem[] = [
  { 
    name: "Componentes",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    href: "/components"
  },
  { 
    name: "Favoritos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/favorites" 
  },
  { 
    name: "Estilos", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 13L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/styles" 
  },
  { 
    name: "Templates", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H10V10H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 4H20V10H14V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 14H10V20H4V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 17C14 17 14.7333 19 17 19C19.2667 19 20 17 20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5 13.5C14.5 13.5 15 15 17 15C19 15 19.5 13.5 19.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/templates" 
  },
  { 
    name: "Assinatura", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 14H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/subscription" 
  }
];

// Navigation items for admins
const adminNavItems: NavItem[] = [
  { 
    name: "Dashboard", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6C4 4.89543 4.89543 4 6 4H8C9.10457 4 10 4.89543 10 6V8C10 9.10457 9.10457 10 8 10H6C4.89543 10 4 9.10457 4 8V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 6C14 4.89543 14.8954 4 16 4H18C19.1046 4 20 4.89543 20 6V8C20 9.10457 19.1046 10 18 10H16C14.8954 10 14 9.10457 14 8V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 16C4 14.8954 4.89543 14 6 14H8C9.10457 14 10 14.8954 10 16V18C10 19.1046 9.10457 20 8 20H6C4.89543 20 4 19.1046 4 18V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 16C14 14.8954 14.8954 14 16 14H18C19.1046 14 20 14.8954 20 16V18C20 19.1046 19.1046 20 18 20H16C14.8954 20 14 19.1046 14 18V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/adm"
  },
  { 
    name: "Gerenciar Componentes", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/adm/components"
  },
  { 
    name: "Gerenciar Usuários", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/adm/users",
    badge: 2
  },
  { 
    name: "Gerenciar Assinaturas", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/adm/subscriptions" 
  },  { 
    name: "Estatísticas", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M7 17V13M12 17V9M17 17V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/adm/statistics" 
  }
];

export default function Sidebar({ items, isAdmin = false, onCollapseChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [bestPlan, setBestPlan] = useState<Plan | null>(null);
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Determine which navigation items to use
  const navItemsToUse = items || (isAdmin ? adminNavItems : userNavItems);
  
  // Fetch subscription and best plan
  useEffect(() => {
    async function loadData() {
      if (user?.id) {
        try {
          // Load user subscription
          const subscription = await SubscriptionService.getCurrentSubscription(user.id);
          setUserSubscription(subscription);
          
          // Load best plan if user doesn't have a subscription
          if (!subscription) {
            const plans = await SubscriptionService.getPlans();
            // Find the highlighted plan or the most expensive plan if none is highlighted
            const highlighted = plans.find(plan => plan.highlighted);
            if (highlighted) {
              setBestPlan(highlighted);
            } else if (plans.length > 0) {
              // Sort by price descending and take the most expensive one
              const sortedPlans = [...plans].sort((a, b) => b.price - a.price);
              setBestPlan(sortedPlans[0]);
            }
          }
        } catch (error) {
          console.error('Error loading subscription data:', error);
        }
      }
    }
    
    loadData();
  }, [user]);
  
  // Check if an item is active based on the current route
  const isActive = (href: string, alwaysActive?: boolean, index?: number) => {
    if (alwaysActive) return true;
    if (pathname === null) return false;
    if (href === "/home" && pathname === "/") return true;
    
    // If we're on the home page and this is the first item in the menu (Components)
    if ((pathname === "/" || pathname === "/home") && href === "/components" && !isAdmin) return true;
    
    // Special logic for admin dashboard
    if (href === "/adm") {
      // If we're exactly on the /adm page, mark as active
      return pathname === "/adm";
    }
    
    // For other items, check for exact match or if it's a subpath
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Add event to listen for sidebar toggle from header
  useEffect(() => {
    const handleToggleSidebar = (event: CustomEvent<boolean>) => {
      if (window.innerWidth <= 768) {
        setMobileOpen(event.detail);
      }
    };

    // Custom typing for the event
    const customEventListener = (e: Event) => {
      handleToggleSidebar(e as CustomEvent<boolean>);
    };

    document.addEventListener('toggleSidebar', customEventListener);
    
    // Detect screen size changes
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('toggleSidebar', customEventListener);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };
  
  return (
    <>
      {mobileOpen && (
        <div 
          className={styles.sidebarOverlay} 
          onClick={() => setMobileOpen(false)} 
        />
      )}
      <aside 
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
      >
        <div className={styles.sidebarHeader}>
          {!collapsed && <h3 className={styles.sidebarTitle}>{isAdmin ? "Administração" : "Menu"}</h3>}
          <button
            onClick={toggleCollapse}
            className={styles.collapseButton}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              : 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItemsToUse.map((item, index) => {
              const active = isActive(item.href, item.alwaysActive, index);
              
              return (
                <li 
                  key={index} 
                  className={`${styles.navItem} ${active ? styles.active : ''} ${item.highlight ? styles.highlight : ''}`}
                  onMouseEnter={() => collapsed && setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link href={item.href}>
                    <span className={`${styles.navLink} ${active ? styles.activeLink : ''}`}>
                      <span className={styles.navIcon}>{item.icon}</span>
                      {!collapsed && (
                        <span className={styles.navText}>
                          {item.name}
                          {item.badge && <span className={styles.badge}>{item.badge}</span>}
                        </span>
                      )}
                      
                      {/* Tooltip for collapsed mode */}
                      {collapsed && hoveredItem === item.name && (
                        <div className={styles.tooltip}>
                          {item.name}
                          {item.badge && <span className={styles.tooltipBadge}>{item.badge}</span>}
                        </div>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Plan information section */}
          {!isAdmin && !collapsed && (
            <div className={styles.planSection}>
              {userSubscription && userSubscription.plan ? (
                <div className={styles.currentPlan}>
                  <h4 className={styles.planTitle}>Seu Plano Atual</h4>
                  <div className={styles.planName}>{userSubscription.plan.name}</div>
                  <div className={styles.planExpiry}>
                    Expira em: {new Date(userSubscription.endDate).toLocaleDateString()}
                  </div>
                </div>
              ) : bestPlan && (                <div className={styles.planPromo}>
                  <div className={styles.promoBadge}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" strokeWidth="0"/>
                    </svg>
                    <span>Recomendado</span>
                  </div>
                  <h4 className={styles.promoTitle}>Atualize seu Plano!</h4>
                  <div className={styles.promoPlan}>
                    <span className={styles.planName}>{bestPlan.name}</span>
                    <div className={styles.planPriceContainer}>
                      <div className={styles.planPrice}>
                        R$ {typeof bestPlan.price === 'number' ? bestPlan.price.toFixed(2) : Number(bestPlan.price).toFixed(2)}
                      </div>
                      {bestPlan.discount && (
                        <div className={styles.discountTag}>
                          <span className={styles.discountValue}>-{bestPlan.discount}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.planFeatures}>
                    <div className={styles.planFeature}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Acesso ilimitado</span>
                    </div>
                    <div className={styles.planFeature}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Suporte premium</span>
                    </div>
                  </div>
                  <Link href="/subscription">
                    <span className={styles.upgradeButton}>
                      <span>Ver Plano</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </Link>
                </div>
              )}
            </div>
          )}        </nav>
      </aside>
    </>
  );
}