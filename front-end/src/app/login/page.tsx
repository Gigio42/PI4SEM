"use client";

import { useState, useEffect } from "react";
import styles from "./login.module.css";
import LoginForm from "./form";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import Image from "next/image";

export default function LoginPage() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };
  return (
    <div className={`${styles.container} ${loaded ? styles.loaded : ""}`}>
      <div className={styles.themeToggleContainer}>
        <ThemeToggle />
      </div>
      
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Bem-vindo</h1>
        <p className={styles.subtitle}>Entre em sua conta para continuar</p>
        
        <LoginForm />
        
        <div className={styles.divider}>ou</div>
          <button className={styles.googleButton} onClick={handleGoogleLogin}>
          <Image 
            src="/google-logo.svg" 
            alt="Google Logo" 
            width={20} 
            height={20} 
            className={styles.googleLogo} 
          />
          Continuar com Google
        </button>
      </div>
      
      <div className={styles.bgGradient}></div>
    </div>
  );
}