import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthContextType {
  token: string | null;
  githubToken: string | null;
  loading: boolean;
  login: () => Promise<boolean>;
  githubLogin: () => Promise<void>;
  handleGithubCallback: (code: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isGitHubAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
