'use client';


import ProjectOverview from '@/app/components/ProjectOverview';
import RecentDocuments from '@/app/components/RecentDocuments';
import ProjectMilestones from '@/app/components/ProjectMilestones';

export default function ProjectPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <ProjectOverview />
            <RecentDocuments />
            <ProjectMilestones />
          </div>
        </div>
      </div>
    </div>
  );
}