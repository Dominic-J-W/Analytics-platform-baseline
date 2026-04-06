import { createBrowserRouter } from 'react-router';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { Login } from './components/auth/Login';
import { Settings } from './components/settings/Settings';
import { Operations } from './components/operations/Operations';
import { Reports } from './components/reports/Reports';
import { Products } from './components/products/Products';
import { Sensors } from './components/sensors/Sensors';
import { DowntimeFactors } from './components/downtime/DowntimeFactors';
import { UserManagement } from './components/admin/UserManagement';
import { AuditLogs } from './components/admin/AuditLogs';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'operations',
        element: <Operations />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'sensors',
        element: <Sensors />,
      },
      {
        path: 'downtime',
        element: <DowntimeFactors />,
      },
      {
        path: 'users',
        element: <UserManagement />,
      },
      {
        path: 'audit',
        element: <AuditLogs />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);