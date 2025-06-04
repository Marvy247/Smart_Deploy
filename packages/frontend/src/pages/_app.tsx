import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { GitHubAuthProvider } from '../contexts/GitHubAuthContext';
import Layout from '../components/layout/Layout';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <GitHubAuthProvider>
          <Layout>
          <Component {...pageProps} />
          </Layout>
        </GitHubAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
