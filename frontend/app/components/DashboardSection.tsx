import React from 'react';

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, children }) => {
  return (
    <>
      <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">{title}</h2>
      {children}
    </>
  );
};

export default DashboardSection;