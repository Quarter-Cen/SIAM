import { AuthProvider } from "@/app/context/AuthContextForStudent";
import { ReactNode } from "react";
import Header from "@/app/components/Header";
import IsHaveTopicLayout from "../../../../components/IsHaveTopicLayout";
export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <IsHaveTopicLayout>
        <Header />
        <main>{children}</main>
      </IsHaveTopicLayout>
    </AuthProvider>
  );
}
