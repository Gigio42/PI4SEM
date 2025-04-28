"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { useAuth } from "../../../src/contexts/AuthContext";
import LoginForm from "./form";
import styles from "./login.module.css";

export default function LoginPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, login } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();  
  
  // Check authentication status on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    // Function to handle successful authentication and redirect
    const handleAuthenticated = (userData: any) => {
      console.log("User authenticated, redirecting to home");
      router.push('/home');
    };
    
    // Check for user_info cookie which may be set by Google OAuth
    const userInfoCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_info='));
      
    if (userInfoCookie) {
      try {
        // Parse and use the user info from the cookie
        const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
        console.log("Found user_info cookie, using for authentication:", userInfo);
        
        // Use the login function from auth context (obtained via destructuring)
        login(userInfo);
        
        // Clear this cookie as we've processed it
        document.cookie = "user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Redirect to home
        handleAuthenticated(userInfo);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error("Error parsing user_info cookie:", e);
      }
    }
    
    // If user is already authenticated in context, redirect to home
    if (user) {
      handleAuthenticated(user);
    } else {
      // Check for authentication session from backend
      fetch("http://localhost:3000/auth/session-check", {
        credentials: "include", // Important for cookies
      })
        .then(response => response.json())
        .then(data => {
          if (data.authenticated && data.user) {
            console.log("Session check found authenticated user");
            login(data.user); // Use the login function from destructuring
            handleAuthenticated(data.user);
          }
        })
        .catch(error => {
          console.error("Error checking authentication:", error);
        });
    }
    
    return () => clearTimeout(timer);
  }, [user, router]);

  // Prevent flashing the login form if already authenticated
  if (user) {
    return null;
  }

  return (
    <div className={`${styles.container} ${isLoaded ? styles.loaded : ""}`}>
      <div className={styles.bgGradient}></div>
      
      <div className={styles.themeToggleContainer}>
        <button 
          onClick={toggleTheme} 
          aria-label={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          {isDarkMode ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.93 19.07L6.34 17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
      
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Bem-vindo</h1>
        <p className={styles.subtitle}>Entre com sua conta para continuar</p>
        
        {/* Using the LoginForm component */}
        <LoginForm />
      </div>
    </div>
  );
}