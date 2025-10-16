import { createBrowserRouter, Navigate } from 'react-router-dom';
import App, {
  HomePage,
  LoginPage,
  RegisterPage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  DashboardPage,
  InvestmentPage,
  DepositPage,
  WithdrawPage,
  SettingsPage,
  NotFoundPage
} from '../App';

import UnauthorizedPage from '../components/common/UnauthorizedPage';
import Layout from '../components/layout/Layout';
import PrivateRoute from '../components/routes/PrivateRoute';
import AdminRoute from '../components/routes/AdminRoute';

// Configuration des routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Routes publiques
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/unauthorized", element: <UnauthorizedPage /> },
      
      // Routes protégées
      {
        path: "/",
        element: (
          <PrivateRoute requireEmailVerification={true}>
            <Layout />
          </PrivateRoute>
        ),
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/invest", element: <InvestmentPage /> },
          { path: "/deposit", element: <DepositPage /> },
          { path: "/withdraw", element: <WithdrawPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
      
      // Routes admin
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <Layout />
          </AdminRoute>
        ),
        children: [
          { path: "*", element: <div>Admin Panel</div> },
        ],
      },
      
      // 404 - Doit être la dernière route
      { path: "*", element: <NotFoundPage /> },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

export { router };
