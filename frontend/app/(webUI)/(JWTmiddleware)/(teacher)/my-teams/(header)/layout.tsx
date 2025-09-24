'use client'
import { ReactNode } from 'react';
import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from "next/navigation";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const teamId = params?.teamId as string; // ✅ cast เอง

  const pathname = usePathname();

  const isOverviewActive = pathname === `/my-teams/teams_dashboard/${teamId}`;
  const isIndividualPerformanceActive = pathname === `/my-teams/teams_individual_performance/${teamId}`;

  return (
    <main>
      <div className="pb-3">
        <div className="flex border-b border-[#dde1e3] px-4 gap-8">
          <Link
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${isOverviewActive ? 'border-b-[#121416] text-[#121416]' : 'border-b-transparent text-[#6a7681]'}`}
            href={`/my-teams/teams_dashboard/${teamId}`}   // ✅ แก้ href
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">
              ภาพรวม
            </p>
          </Link>
          <Link
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${isIndividualPerformanceActive ? 'border-b-[#121416] text-[#121416]' : 'border-b-transparent text-[#6a7681]'}`}
            href={`/my-teams/teams_individual_performance/${teamId}`}   // ✅ แก้ href
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">
              ประสิทธิภาพส่วนบุคคล
            </p>
          </Link>
        </div>
      </div>
      {children}
    </main>
  );
}
