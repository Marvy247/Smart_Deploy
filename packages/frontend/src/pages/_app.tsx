import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="py-6">
            <Component {...pageProps} />
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
