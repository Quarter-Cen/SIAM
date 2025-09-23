import { AuthProvider } from "@/app/context/AuthContextForStudent";
import { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import IsHaveTopicLayout from "../../../../components/IsHaveTopicLayout";
export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <IsHaveTopicLayout>
        <Navbar />
        <main>{children}</main>
      </IsHaveTopicLayout>
    </AuthProvider>
  );
}
