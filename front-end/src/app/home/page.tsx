"use client";

import { useState, useEffect } from "react";
import styles from "./home.module.css";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { Component } from "@/types/component";
import { ComponentsService } from "@/services/ComponentsService";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setLoaded(true);
    // Redirecionar automaticamente para a página de componentes
    router.push("/components");
  }, [router]);
    
  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layoutContainer}>
        {/* Sidebar para navegação */}
        <Sidebar isAdmin={false} />
        <main className={`${styles.mainContent} ${loaded ? styles.loaded : ""}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Redirecionando...</h1>
            <p className={styles.pageDescription}>
              Você será redirecionado para a página de componentes.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}