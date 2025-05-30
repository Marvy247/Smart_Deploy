import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';

export default function GitHubCallback() {
  const router = useRouter();
  const { handleGithubCallback } = useAuthContext();

  useEffect(() => {
    const { code } = router.query;
    if (code && typeof code === 'string') {
      handleGithubCallback(code);
    }
  }, [router.query, handleGithubCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing GitHub Authentication</h1>
        <p>Please wait while we authenticate your GitHub account...</p>
      </div>
    </div>
  );
}
