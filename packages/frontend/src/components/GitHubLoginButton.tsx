import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';

export function GitHubLoginButton() {
  const { githubLogin, loading } = useAuthContext();
  return (
    <button
      type="button"
      disabled={loading}
      onClick={githubLogin}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '0.5rem 1rem',
        backgroundColor: '#24292e',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      {loading ? (
        <span style={{ marginRight: '8px' }}>Redirecting...</span>
      ) : (
        <span style={{ marginRight: '8px' }}>GitHub</span>
      )}
      Continue with GitHub
    </button>
  );
}
