import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { token_hash, type } = router.query;
      
      if (token_hash && type === 'signup') {
        try {
          const { error } = await supabase.auth.verifyOtp({ 
            token_hash, 
            type: 'signup' 
          });
          
          if (error) throw error;
          router.push('/login?verified=true');
        } catch (error) {
          console.error('Verification error:', error);
          router.push('/auth/error?error=verification_failed');
        }
      } else {
        router.push('/auth/error?error=invalid_token');
      }
    };

    if (router.isReady) {
      handleAuthCallback();
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Vérification en cours...</p>
      </div>
    </div>
  );
}
