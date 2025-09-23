import React from 'react';

interface ProgressCardProps {
  title: string;
  value: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ title, value }) => {
  return (
    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dde1e3]">
      <p className="text-[#121416] text-base font-medium leading-normal">{title}</p>
      <p className="text-[#121416] tracking-light text-2xl font-bold leading-tight">{value}</p>
    </div>
  );
};

export default ProgressCard;