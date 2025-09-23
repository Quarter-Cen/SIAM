
import AuthLayout from '../../../../components/AuthLayout';
import IsntHaveTopicLayout from "../../../../components/IsntHaveTopicLayout";
import { ReactNode } from 'react';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout allowedRoles={['student']}>
      <IsntHaveTopicLayout>
              <main>
        {children}
      </main>
      </IsntHaveTopicLayout>

    </AuthLayout>
  );
}