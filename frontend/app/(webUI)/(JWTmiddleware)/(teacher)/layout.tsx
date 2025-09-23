import AuthLayout from '../../../components/AuthLayout';
import { AuthProvider } from '@/app/context/AuthContext';
import { ReactNode } from 'react';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout allowedRoles={['teacher']}>
      <AuthProvider>
      <main>
        {children}
      </main>
      </AuthProvider>
    </AuthLayout>
  );
}