import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute wrapper component
 * 
 * Optional component that can be used to wrap individual screens
 * for an additional layer of authentication protection.
 * 
 * Usage:
 * ```tsx
 * export default function SomeProtectedScreen() {
 *   return (
 *     <ProtectedRoute>
 *       <View>Your protected content here</View>
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            // User not authenticated - redirect to welcome screen
            router.replace('/(auth)/welcome');
        }
    }, [user, isLoading]);

    // Show loading screen while checking authentication
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Don't render anything if user is not authenticated
    if (!user) {
        return null;
    }

    // User is authenticated - render the protected content
    return <>{children}</>;
}
