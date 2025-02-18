import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
// import './styles/index.css';
import Root from './routes/root.jsx';

import ErrorPage from './pages/error-page.jsx';
// import App.css
import './styles/App.css';

import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from '@tanstack/react-query';
import Login from './pages/Login.jsx';

import { AuthProvider } from './contexts/AuthContext.jsx';
import DataUpload from './pages/DataUpload.jsx';

import CheckListPage from './pages/CheckListPage.jsx';
import Settings from './pages/Settings.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <DataUpload />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/upload',
        element: (
            <ProtectedRoute>
                <DataUpload />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/checklist',
        element: (
            <ProtectedRoute>
                <CheckListPage />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/login',
        element: <Login />,
        errorElement: <ErrorPage />,
    },

    // {
    //     path: '/settings',
    //     element: <Settings />,
    //     errorElement: <ErrorPage />,
    // },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </AuthProvider>
);
