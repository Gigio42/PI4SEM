"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { checkAuthentication } = useAuth();
  const [message, setMessage] = useState("Verificando autenticação...");

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setMessage("Verificando autenticação...");
        console.log("Auth callback: Checking authentication status");
        
        // Try to check authentication status
        const isAuthenticated = await checkAuthentication();
        
        if (isAuthenticated) {
          setMessage("Autenticado com sucesso! Redirecionando...");
          console.log("Auth callback: User is authenticated, redirecting to home");
          setTimeout(() => router.push("/home"), 1000);
        } else {
          setMessage("Falha na autenticação. Redirecionando para login...");
          console.log("Auth callback: Authentication failed, redirecting to login");
          setTimeout(() => router.push("/login"), 1000);
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        setMessage("Erro ao verificar autenticação. Redirecionando para login...");
        setTimeout(() => router.push("/login"), 1000);
      }
    };

    checkAuthStatus();
  }, [router, checkAuthentication]);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "sans-serif"
    }}>
      <h1>Processando Autenticação</h1>
      <p>{message}</p>
      <div style={{
        marginTop: "20px",
        width: "40px",
        height: "40px",
        border: "4px solid #f3f3f3",
        borderRadius: "50%",
        borderTop: "4px solid #3498db",
        animation: "spin 1s linear infinite"
      }}></div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
