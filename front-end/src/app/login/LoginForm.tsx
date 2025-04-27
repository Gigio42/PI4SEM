import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { apiBaseUrl } from '../../services/config';
import Image from 'next/image';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Add your regular login logic here

    setLoading(false);
  };

  // Function to handle Google login
  const handleGoogleLogin = () => {
    // Redirect to the backend's Google auth endpoint
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
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
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      <div className={styles.divider}>ou</div>
      <button 
        type="button"
        className={styles.googleButton}
        onClick={handleGoogleLogin}
      >
        <Image 
          src="/google-logo.svg" 
          alt="Google" 
          width={18} 
          height={18} 
          className={styles.googleLogo}
        />
        Entrar com Google
      </button>
    </div>
  );
}