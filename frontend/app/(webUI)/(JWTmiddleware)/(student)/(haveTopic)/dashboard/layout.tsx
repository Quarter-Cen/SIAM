

import DashboardHeader from '@/app/components/DashboardHeader'
import { ReactNode } from "react";

export default function TopicLayout({ children }: { children: ReactNode }) {
  return (
    <>

      <DashboardHeader
        title="Dashboard"
        subtitle="วิเคราะห์ความคืบหน้าโครงงาน"
      />
        <main>{children}</main>

    </>
  );
}
