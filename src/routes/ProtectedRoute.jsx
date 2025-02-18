import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { auth } from '../services/firebase';

export const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    console.log('user', user);

    if (!user) {
        return <Navigate to='/login' />;
    }

    return children;
};
