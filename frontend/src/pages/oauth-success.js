import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

/**
 * /oauth-success
 * Landing page after Google OAuth redirect.
 * Reads token from URL, saves to localStorage, then redirects to homepage.
 */
export default function OAuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const { token, name, email } = router.query;

    if (token) {
      // Save token and user info — same keys as normal login
      localStorage.setItem('specs_token', token);
      localStorage.setItem('specs_user', JSON.stringify({ name, email }));
      window.dispatchEvent(new Event('storage'));
    }

    // Redirect to home after 1 second
    setTimeout(() => router.push('/'), 1000);
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>Signing you in... — Lekya Specs</title>
      </Head>
      <div className="min-h-screen bg-premium-black flex flex-col items-center justify-center gap-5">
        <div className="w-12 h-12 border-4 border-premium-accent/30 border-t-premium-accent rounded-full animate-spin" />
        <p className="text-white font-medium text-lg">Signing you in with Google...</p>
        <p className="text-premium-gray text-sm">Redirecting to your dashboard</p>
      </div>
    </>
  );
}
