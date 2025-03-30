"use client";

import styles from "./login.module.css";
import LoginForm from "./form";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    // Redireciona o navegador para o endpoint do backend
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <LoginForm />
      <button className={styles.googleButton} onClick={handleGoogleLogin}>
        Login com Google
      </button>
    </div>
  );
}