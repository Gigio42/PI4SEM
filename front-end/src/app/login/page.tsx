"use client";

import { useState, useEffect } from "react";
import styles from "./login.module.css";
import LoginForm from "./form";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";

export default function LoginPage() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className={`${styles.container} ${loaded ? styles.loaded : ""}`}>
      <div className={styles.themeToggleContainer}>
        <ThemeToggle />
      </div>
      
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Bem-vindo</h1>
        <p className={styles.subtitle}>Entre em sua conta para continuar</p>
        
        <LoginForm />
      </div>
      
      <div className={styles.bgGradient}></div>
    </div>
  );
}