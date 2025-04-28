import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

export default function AuthDebugPage() {
  const { user, logout } = useAuth();
  const [apiChecks, setApiChecks] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [configInfo, setConfigInfo] = useState<any>({});

  useEffect(() => {
    // Capturar informações de configuração importantes
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const currentOrigin = window.location.origin;
    const googleAuthUrl = `${apiBaseUrl}/auth/google`;
    
    setConfigInfo({
      apiBaseUrl,
      currentOrigin,
      googleAuthUrl,
      environment: process.env.NODE_ENV,
      cookieInfo: document.cookie ? "Cookies presentes" : "Sem cookies",
      corsIssue: apiBaseUrl !== currentOrigin ? 
        "Possível problema de CORS (origens diferentes)" : 
        "Mesma origem (CORS não deve ser problema)",
    });
    
    async function checkAllEndpoints() {
      setLoading(true);
      const results: any = {};

      // Try different authentication-related endpoints
      const endpoints = [
        '/api/auth/session',
        '/api/auth/check-auth',
        '/api/user/me',
        `${apiBaseUrl}/auth/session-check`,
        `${apiBaseUrl}/auth/check-auth`
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await axios.get(endpoint, { 
            withCredentials: true,
            timeout: 5000 // 5 second timeout
          });
          results[endpoint] = {
            status: res.status,
            data: res.data,
            success: true
          };
        } catch (error: any) {
          results[endpoint] = {
            status: error.response?.status || 'No response',
            error: error.message,
            success: false
          };
        }
      }

      // Listar cookies presentes (nomes apenas)
      const cookies = document.cookie.split(';').map(c => c.trim());
      results['cookies'] = cookies.length > 0 ? cookies : 'Nenhum cookie encontrado';

      // Verificar localStorage para informações de usuário
      try {
        const storedUser = localStorage.getItem('user');
        results['localStorage'] = storedUser ? JSON.parse(storedUser) : 'Sem usuário no localStorage';
      } catch (e) {
        results['localStorage'] = `Erro ao ler localStorage: ${e}`;
      }

      setApiChecks(results);
      setLoading(false);
    }

    checkAllEndpoints();
  }, []);

  const testGoogleAuth = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    window.location.href = `${apiBaseUrl}/auth/google`;
  };
  
  // Added function to check for user_info cookie specifically
  const checkUserInfoCookie = () => {
    const userInfoCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_info='));
    
    if (userInfoCookie) {
      try {
        return JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
      } catch (e) {
        return `Error parsing cookie: ${e instanceof Error ? e.message : String(e)}`;
      }
    }
    return null;
  };

  // Added utility to directly simulate a Google auth redirect
  const simulateGoogleRedirect = () => {
    // Build a URL that mimics the redirect from backend after Google auth
    const currentUrl = window.location.origin + "/home";
    const redirectUrl = `${currentUrl}?auth=google&t=${Date.now()}`;
    
    // Set a test cookie that mimics what the backend would set
    const testUserInfo = {
      id: 999,
      name: "Test Google User",
      email: "test.google@example.com",
      role: "user",
      picture: "https://ui-avatars.com/api/?name=Test+User"
    };
    
    document.cookie = `user_info=${encodeURIComponent(JSON.stringify(testUserInfo))}; path=/;`;
    
    // Navigate to the URL
    window.location.href = redirectUrl;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Auth Debug Tool</h1>
      
      <h2>Configuração Atual</h2>
      <pre>{JSON.stringify(configInfo, null, 2)}</pre>
      
      <h2>Current Auth Context</h2>
      <pre>{JSON.stringify({ user, isAuthenticated: !!user }, null, 2)}</pre>
      
      <h2>Auth Endpoint Checks</h2>
      {loading ? (
        <p>Checking endpoints...</p>
      ) : (
        <pre>{JSON.stringify(apiChecks, null, 2)}</pre>
      )}

      <h2>GoogleAuth Debug</h2>
      <div style={{ marginBottom: '15px' }}>
        <h3>User Info Cookie</h3>
        <pre>{JSON.stringify(checkUserInfoCookie(), null, 2) || "No user_info cookie found"}</pre>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Refresh Checks
        </button>
        
        <button 
          onClick={testGoogleAuth}
          style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#4285F4', color: 'white', border: 'none' }}
        >
          Test Google Auth
        </button>
        
        <button 
          onClick={simulateGoogleRedirect}
          style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#34A853', color: 'white', border: 'none' }}
        >
          Simulate Google Redirect
        </button>
        
        {user && (
          <button 
            onClick={() => logout && logout()}
            style={{ padding: '8px 16px' }}
          >
            Logout
          </button>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>URLs Corretas para Autenticação:</h3>
        <ul>
          <li><strong>Google Login:</strong> http://localhost:3000/auth/google</li>
          <li><strong>Session Check:</strong> http://localhost:3000/auth/session-check</li>
          <li><strong>Auth Debug:</strong> /auth-debug</li>
          <li><strong>Google Callback:</strong> http://localhost:3000/auth/google/redirect</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Google Authentication Flow:</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li>User clicks "Test Google Auth" button which redirects to <code>/auth/google</code></li>
          <li>Backend initiates OAuth flow with Google</li>
          <li>User authenticates with Google</li>
          <li>Google redirects to backend at <code>/auth/google/redirect</code></li>
          <li>Backend creates/updates user and sets cookies:
            <ul>
              <li><code>auth_token</code> - httpOnly JWT token</li>
              <li><code>user_info</code> - JSON data readable by frontend</li>
            </ul>
          </li>
          <li>Backend redirects to frontend with <code>?auth=google&t=[timestamp]</code></li>
          <li>Frontend detects parameters and reads <code>user_info</code> cookie</li>
          <li>AuthContext updates with user information</li>
        </ol>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
        <h3>Troubleshooting Google Auth:</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li>Check if cookies are being set (inspect Network tab)</li>
          <li>Verify Google API credentials in backend <code>.env</code> file</li>
          <li>Ensure correct redirect URL is configured in Google Console</li>
          <li>Check backend logs for authentication errors</li>
          <li>Verify CORS settings if backend and frontend are on different domains/ports</li>
          <li>Check if <code>user_info</code> cookie is being properly set and read</li>
        </ul>
      </div>
    </div>
  );
}
