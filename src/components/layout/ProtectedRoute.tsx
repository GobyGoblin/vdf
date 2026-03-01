import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI, getCurrentUser } from '@/lib/api';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const location = useLocation();
    const userFromState = (location.state as { user?: unknown })?.user;
    const [user, setUser] = useState<any>(userFromState ?? null);
    const [loading, setLoading] = useState(!userFromState);

    useEffect(() => {
        if (userFromState) {
            setUser(userFromState);
            setLoading(false);
            return;
        }
        const checkAuth = async () => {
            try {
                const { user: userData } = await authAPI.getMe();
                setUser(userData);
            } catch (err) {
                // When /me returns 401 we don't clear token, so keep user from storage and stay on page
                const fallback = getCurrentUser();
                setUser(fallback ?? null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [userFromState]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse font-medium">Authenticating...</p>
                </div>
            </div>
        );
    }

    // If not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If role is not allowed, redirect to their own dashboard or homepage
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.warn(`User role '${user.role}' not authorized for this route. Allowed roles: ${allowedRoles.join(', ')}`);
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    return <>{children}</>;
};
