import AuthLayout from "../../../components/AuthLayout";
import { AuthProvider } from "@/app/context/AuthContext";
import { ReactNode } from "react";
import Sidebar from "@/app/components/Sidebar";
import Navbar from "@/app/components/Teacher_Navbar";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout allowedRoles={["teacher"]}>
      <AuthProvider>
        <main>
          <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
            <Navbar />
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-6 flex flex-1 justify-center py-5">
                <Sidebar />
                <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>
      </AuthProvider>
    </AuthLayout>
  );
}
