import { useAuth } from '../context/AuthContext';

/**
 * Hook to check for specific permissions
 */
export const usePermissions = () => {
    const { user } = useAuth();

    /**
     * Check if user has a specific permission
     */
    const hasPermission = (permission: string): boolean => {
        if (!user) return false;

        // Super admins have all permissions
        if (user.role === 'admin' && (!user.permissions || user.permissions.length === 0)) {
            // If they are admin but permissions array is empty, assume they are super admin or hasn't loaded yet
            // In a real app, we might check for a specific 'all' permission or 'super-admin' role
            return true;
        }

        return user.permissions?.includes(permission) || false;
    };

    /**
     * Check if user has any of the given permissions
     */
    const hasAnyPermission = (permissions: string[]): boolean => {
        return permissions.some(permission => hasPermission(permission));
    };

    /**
     * Check if user has all of the given permissions
     */
    const hasAllPermissions = (permissions: string[]): boolean => {
        return permissions.every(permission => hasPermission(permission));
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin: user?.role === 'admin'
    };
};
