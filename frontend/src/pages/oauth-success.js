import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

/**
 * /oauth-success
 * OAuth Callback Landing Page for Google & Facebook Authentication.
 * Parses token & user details, sets localStorage auth state, and redirects to dashboard.
 */
export default function OAuthSuccess() {
  const router = useRouter();
  const [provider, setProvider] = useState('Google');
  const [statusMsg, setStatusMsg] = useState('Authenticating credentials...');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Fast URL parameter extraction from window.location or Next router query
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || (router.isReady ? router.query.token : null);
    const name = params.get('name') || (router.isReady ? router.query.name : null);
    const email = params.get('email') || (router.isReady ? router.query.email : null);
    const role = params.get('role') || (router.isReady ? router.query.role : null);
    const prov = params.get('provider') || (router.isReady ? router.query.provider : null);
    const errParam = params.get('error') || (router.isReady ? router.query.error : null);

    if (prov) {
      setProvider(prov);
    } else if (email && email.toLowerCase().includes('fb')) {
      setProvider('Facebook');
    }

    if (errParam) {
      setStatusMsg('Authentication could not be completed. Redirecting...');
      setTimeout(() => {
        window.location.href = '/account?error=' + encodeURIComponent(errParam);
      }, 1200);
      return;
    }

    if (token) {
      setStatusMsg(`Welcome, ${name || 'Valued Customer'}! Creating your session...`);

      const userData = {
        name: name || 'Valued Member',
        email: email || '',
        role: role || 'user',
        loyalty_points: 100
      };

      // Save token and user info — same keys as standard authentication
      localStorage.setItem('specs_token', token);
      localStorage.setItem('specs_user', JSON.stringify(userData));

      // Dispatch global storage event for immediate UI context updates
      window.dispatchEvent(new Event('storage'));

      // Smooth redirect to account dashboard
      setTimeout(() => {
        window.location.href = '/account';
      }, 600);
    }
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>Signing In... — lekya.in</title>
      </Head>
      <div className="min-h-screen bg-[#0d0016] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#FAAE62]/20 border-t-[#FAAE62] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-[#FAAE62] font-serif">
            LS
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-white font-serif font-bold text-xl sm:text-2xl tracking-wide">
            Signing you in with {provider}...
          </h2>
          <p className="text-[#FAAE62] text-xs sm:text-sm font-medium">
            {statusMsg}
          </p>
        </div>
      </div>
    </>
  );
}
