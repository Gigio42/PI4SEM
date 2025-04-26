"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../src/contexts/AuthContext"; // Fixed import path (removed extra slash)
import styles from "./login.module.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [formActive, setFormActive] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Changed from setUser to login

  // Efeito para animação inicial
  useEffect(() => {
    setFormActive(true);
  }, []);

  // Validação de email
  const validateEmail = (email: string) => {
    if (!email) return "Email é obrigatório";
    if (!/\S+@\S+\.\S+/.test(email)) return "Email inválido";
    return "";
  };

  // Validação de senha
  const validatePassword = (password: string) => {
    if (!password) return "Senha é obrigatória";
    if (password.length < 6) return "A senha deve ter pelo menos 6 caracteres";
    return "";
  };

  const handleValidation = () => {
    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation of form
    if (!handleValidation()) {
      return;
    }
    
    setIsLoading(true);

    try {
      if (isLogin) {
        // Send login request to real backend
        const response = await fetch("http://localhost:3000/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        if (response.ok) {
          // After successful login, get session info to get real user data
          try {
            const sessionResponse = await fetch("http://localhost:3000/auth/session-check", {
              credentials: "include",
            });
            
            const sessionData = await sessionResponse.json();
            console.log('Session check response:', sessionData);
            
            if (sessionData.authenticated && sessionData.user) {
              // Use real user data from backend with exact role value
              const userData = {
                id: sessionData.user.id,
                name: sessionData.user.name || email.split('@')[0],
                email: sessionData.user.email,
                role: sessionData.user.role || "user" // Preserve exact role string
              };
              
              console.log(`Logging in with role from backend: "${userData.role}"`);
              // Use login function from auth context
              login(userData);
              console.log('User logged in with real backend data:', userData);
              
              // Smooth transition before navigating
              setFormActive(false);
              setTimeout(() => {
                router.push("/home");
              }, 300);
            } else {
              // Fallback if session check doesn't return user data
              
              // Create minimal user data based on the login email
              const fallbackUserData = {
                id: Date.now(),
                name: email.split('@')[0],
                email: email,
                role: "user" // Default to regular user role
              };
              
              console.log(`Using fallback user data with default role: "${fallbackUserData.role}"`);
              login(fallbackUserData);
              console.log('Using fallback user data:', fallbackUserData);
              
              setFormActive(false);
              setTimeout(() => {
                router.push("/home");
              }, 300);
            }
          } catch (sessionError) {
            console.error("Error checking session:", sessionError);
            setErrors({ email: "Login realizado, mas erro ao obter dados de usuário." });
          }
        } else {
          const errorData = await response.json();
          setErrors({ email: errorData.message || "Erro durante o login." });
        }
      } else {
        // For registration, use the real backend endpoint
        const response = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          // After successful registration, log the user in
          try {
            const loginResponse = await fetch("http://localhost:3000/users/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
              credentials: "include",
            });
            
            if (loginResponse.ok) {
              // Use minimal user data based on registration info
              const userData = {
                id: Date.now(), // We'll get a real ID on next login
                name: email.split('@')[0],
                email: email,
                role: "user"
              };
              
              login(userData); // Changed from setUser to login
              console.log('User registered and logged in with backend:', userData);
              
              setFormActive(false);
              setTimeout(() => {
                router.push("/home");
              }, 300);
            } else {
              // Registration succeeded but login failed
              setErrors({ email: "Conta criada com sucesso! Faça login para continuar." });
              setIsLogin(true);
            }
          } catch (loginError) {
            console.error("Error during post-registration login:", loginError);
            setErrors({ email: "Conta criada com sucesso! Faça login para continuar." });
            setIsLogin(true);
          }
        } else {
          try {
            const errorData = await response.json();
            setErrors({ email: errorData.message || "Erro ao criar conta." });
          } catch (e) {
            setErrors({ email: "Erro ao criar conta. Tente novamente." });
          }
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      setErrors({ email: `Erro ao ${isLogin ? "fazer login" : "cadastrar"}. Tente novamente mais tarde.` });
    } finally {
      setIsLoading(false);
    }
  };

  // Alternar entre login e cadastro com animação
  const toggleMode = () => {
    setFormActive(false);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setEmail("");
      setPassword("");
      setErrors({});
      setFormActive(true);
    }, 300);
  };
  
  return (
    <>
      <form 
        className={`${styles.form} ${formActive ? styles.formActive : ""}`} 
        onSubmit={handleSubmit}
        style={{ opacity: formActive ? 1 : 0.5, transform: formActive ? "translateY(0)" : "translateY(10px)" }}
      >
        <div className={`${styles.inputGroup} ${errors.email ? styles.error : email ? styles.valid : ""}`}>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({...errors, email: ""});
            }}
            placeholder=" "
            required
            autoComplete="email"
            aria-label="Email"
            aria-invalid={errors.email ? "true" : "false"}
          />
          <label htmlFor="email">Email</label>
          {errors.email && <div className={styles.inputError} role="alert">{errors.email}</div>}
        </div>
        
        <div className={`${styles.inputGroup} ${errors.password ? styles.error : password ? styles.valid : ""}`}>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({...errors, password: ""});
            }}
            placeholder=" "
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            aria-label="Senha"
            aria-invalid={errors.password ? "true" : "false"}
          />
          <label htmlFor="password">Senha</label>
          {errors.password && <div className={styles.inputError} role="alert">{errors.password}</div>}
        </div>
        
        {isLogin && (
          <div className={styles.forgotPasswordContainer}>
            <button type="button" className={styles.forgotPassword}>
              Esqueceu sua senha?
            </button>
          </div>
        )}
        
        <button 
          type="submit" 
          className={styles.button} 
          disabled={isLoading}
          aria-label={isLogin ? "Entrar" : "Cadastrar"}
          aria-busy={isLoading ? "true" : "false"}
        >
          {isLoading ? (
            <>
              <span className={styles.loadingDot}></span>
              <span className={styles.loadingDot}></span>
              <span className={styles.loadingDot}></span>
            </>
          ) : (
            isLogin ? "Entrar" : "Cadastrar"
          )}
        </button>
      </form>

      <div className={styles.divider}>ou</div>
      
      <button 
        type="button"
        className={styles.googleButton}
        onClick={() => window.location.href = "http://localhost:3000/auth/google"}
        aria-label="Entrar com Google"
      >
        <img 
          src="/google-logo.svg" 
          alt="Google" 
          width="18" 
          height="18" 
          className={styles.googleLogo}
        />
        Entrar com Google
      </button>

      <div className={`${styles.switchMode} ${styles.formToggle}`}>
        {isLogin ? (
          <>
            Não tem uma conta?{" "}
            <button 
              className={styles.link} 
              onClick={toggleMode} 
              type="button"
              aria-label="Alternar para tela de cadastro"
            >
              Cadastre-se
            </button>
          </>
        ) : (
          <>
            Já tem uma conta?{" "}
            <button 
              className={styles.link} 
              onClick={toggleMode} 
              type="button"
              aria-label="Alternar para tela de login"
            >
              Entre aqui
            </button>
          </>
        )}
      </div>
    </>
  );
}