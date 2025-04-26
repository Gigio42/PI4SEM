import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

export default function AuthDebugPage() {
  const { user, logout } = useAuth();
  const [apiChecks, setApiChecks] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAllEndpoints() {
      setLoading(true);
      const results: any = {};

      // Try different authentication-related endpoints
      const endpoints = [
        '/api/auth/session',
        '/api/user/me',
        '/api/auth/check-auth',
        '/auth/session-check',
        '/auth/check-auth'
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await axios.get(endpoint, { withCredentials: true });
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

      setApiChecks(results);
      setLoading(false);
    }

    checkAllEndpoints();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Auth Debug Tool</h1>
      
      <h2>Current Auth Context</h2>
      <pre>{JSON.stringify({ user, isAuthenticated: !!user }, null, 2)}</pre>
      
      <h2>Auth Endpoint Checks</h2>
      {loading ? (
        <p>Checking endpoints...</p>
      ) : (
        <pre>{JSON.stringify(apiChecks, null, 2)}</pre>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Refresh Checks
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
    </div>
  );
}
