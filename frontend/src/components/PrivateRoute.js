import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si se especifican roles permitidos, verificar que el usuario tenga uno de esos roles
    if (allowedRoles && allowedRoles.length > 0) {
        if (!user || !allowedRoles.includes(user.rol)) {
            // Redirigir al dashboard correspondiente según el rol del usuario
            const userRole = user?.rol;
            if (userRole === 'ADMINISTRADOR') {
                return <Navigate to="/admin/dashboard" replace />;
            } else if (userRole === 'MECANICO') {
                return <Navigate to="/mecanico/dashboard" replace />;
            }
            return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
