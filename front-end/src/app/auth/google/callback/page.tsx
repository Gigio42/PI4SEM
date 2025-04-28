"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../../src/contexts/AuthContext";

export default function GoogleCallback() {
  const router = useRouter();
  const { checkAuthentication } = useAuth();
  const [status, setStatus] = useState<string>("Autenticando...");

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setStatus("Verificando autenticação...");
        const isAuthenticated = await checkAuthentication();
        
        if (isAuthenticated) {
          setStatus("Autenticado! Redirecionando...");
          setTimeout(() => {
            router.push("/home");
          }, 1000);
        } else {
          setStatus("Falha na autenticação. Redirecionando para o login...");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (error) {
        console.error("Error during authentication verification:", error);
        setStatus("Erro durante autenticação. Redirecionando para o login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    verifyAuth();
  }, [router, checkAuthentication]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center",
      padding: "0 2rem"
    }}>
      <h1>Autenticação Google</h1>
      <div style={{ marginTop: "2rem" }}>
        <p>{status}</p>
        <div style={{ marginTop: "1rem" }}>
          <div style={{
            display: "inline-block",
            width: "30px",
            height: "30px",
            border: "3px solid #f3f3f3",
            borderTop: "3px solid #6366F1",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
