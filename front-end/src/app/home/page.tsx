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
    // Check if this is a Google OAuth redirect by looking at URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const authSource = searchParams.get('auth');
    const timestamp = searchParams.get('t');
    
    // If this is a redirect from Google OAuth, check for user_info cookie
    if (authSource === 'google' && timestamp) {
      const userInfoCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_info='));
        
      if (userInfoCookie) {
        try {
          // Parse user info from cookie
          const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
          console.log("Home page detected Google OAuth redirect with user:", userInfo);
          
          // Store the user info in localStorage for consistency with the rest of the app
          localStorage.setItem('user', JSON.stringify(userInfo));
          
          // Clean up the URL by removing auth parameters
          window.history.replaceState({}, document.title, '/home');
          
          // Clear the cookie as we've processed it
          document.cookie = "user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } catch (e) {
          console.error("Error processing user_info cookie in home page:", e);
        }
      }
    }
    
    setLoaded(true);
    // Redirect to components page
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