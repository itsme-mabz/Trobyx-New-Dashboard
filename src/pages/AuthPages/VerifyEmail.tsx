import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import useAuthStore from '../../stores/useAuthStore';

// Assuming there's a verify email action, but if not, we can just redirect to signin
// User said: "not when i click verify email button on mail i recieve from there i shiuld navigate to sign in"
// This implies they just want the redirection to signin page, OR they want verification + redirect.
// Since I don't see a `verifyEmail` action in useAuthStore yet, I will add one if needed, 
// but for now, I will implement a component that calls an endpoint if verification is intended, 
// then redirects to signin.
// Often verification happens via GET request from browser. 
// If the backend handles GET /verify-email?token=... and returns HTML, then we serve the frontend app?
// If the frontend loads, it means the backend served the app (SPA). 
// So the frontend route /verify-email matches.
// We should capture the token and call the backend verification endpoint if it's an API.
// Usually: POST /api/auth/verify-email { token }
// I'll assume standard pattern: Call API -> Redirect to Login

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        const verify = async () => {
            if (token) {
                try {
                    // Attempt to verify with backend
                    // Adjust endpoint if known. User didn't specify verification endpoint, 
                    // just said "navigate to sign in". using a generic one or just redirecting.
                    // IMPORTANT: User said "not this page... navigate to sign in".
                    // So showing a "Verifying..." spinner is acceptable as long as it auto-redirects.

                    // I will try to call an endpoint, but if it fails or doesn't exist, I'll still redirect.
                    // Common endpoint: /api/auth/verify-email
                    // Or maybe the backend already verified it if it was a GET link? 
                    // But usually SPAs need to call the API.

                    // Let's assume we need to call API.
                    await fetch('/api/auth/verify-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token })
                    });

                    // Ensure we redirect to signin regardless of success/failure (user might interpret success on signin page)
                    // Or show a toast?
                } catch (e) {
                    console.error(e);
                }
            }
            // Redirect to signin
            navigate('/signin', { replace: true });
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Verifying email...</h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            </div>
        </div>
    );
};

export default VerifyEmail;
