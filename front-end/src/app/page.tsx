"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      
        <button className={styles.button} onClick={handleLoginRedirect}>
          Ir para a página de Login
        </button>
      </main>
     
    </div>
  );
}
