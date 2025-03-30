"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/users/login?email=${email}&password=${password}`, {
        method: "GET",
        credentials: "include", // Inclui cookies na requisição
      });

      if (response.ok) {
        router.push("/home"); // Redireciona para a página home
      } else {
        const errorData = await response.json();
        alert(`Erro ao fazer login: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao fazer login. Tente novamente mais tarde.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push("/home"); // Redireciona para a página home
      } else {
        const errorData = await response.json();
        alert(`Erro ao cadastrar: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao cadastrar. Tente novamente mais tarde.");
    }
  };

  return (
    <div>
      <form className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.buttonGroup}>
          <button type="button" className={styles.button} onClick={handleLogin}>
            Entrar
          </button>
          <button type="button" className={styles.button} onClick={handleRegister}>
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
}