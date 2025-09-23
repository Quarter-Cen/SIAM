'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  const pathname = usePathname();

  const isOverviewActive = pathname === '/dashboard';
  const isIndividualPerformanceActive = pathname === '/dashboard/individual_performance';

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">
              {title}
            </p>
            <p className="text-[#6a7681] text-sm font-normal leading-normal">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="pb-3">
          <div className="flex border-b border-[#dde1e3] px-4 gap-8">
            <Link
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${isOverviewActive ? 'border-b-[#121416] text-[#121416]' : 'border-b-transparent text-[#6a7681]'}`}
              href="/dashboard"
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                ภาพรวม
              </p>
            </Link>
            <Link
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${isIndividualPerformanceActive ? 'border-b-[#121416] text-[#121416]' : 'border-b-transparent text-[#6a7681]'}`}
              href="/dashboard/individual_performance"
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                ประสิทธิภาพส่วนบุคคล
              </p>
            </Link>
          </div>
        </div>
        {/* The {children} prop has been removed from this component to be handled in the main page layout. */}
      </div>
    </div>
  );
};

export default DashboardHeader;