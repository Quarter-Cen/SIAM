'use client'

import Sidebar from '@/app/components/Sidebar';
import Topics from '@/app/components/Topics';
import Navbar from '@/app/components/Teacher_Navbar';
export default function Home() {
  return (
 
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <Navbar />
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <Topics />
          </div>
        </div>
      </div>
    </div>
  );
}