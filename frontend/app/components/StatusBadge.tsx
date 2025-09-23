// components/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bgColor = 'bg-[#f0f2f5]'; // สีเทาอ่อน (Default)
  let textColor = 'text-[#111418]'; // สีดำ (Default)

  switch (status) {
    case 'ส่งล่าช้า':
      bgColor = 'bg-red-100'; // สีแดงอ่อน
      textColor = 'text-red-800'; // สีแดงเข้ม
      break;
    case 'ส่งแล้ว':
      bgColor = 'bg-green-100'; // สีเขียวอ่อน
      textColor = 'text-green-800'; // สีเขียวเข้ม
      break;
    case 'ยังไม่ส่ง':
      bgColor = 'bg-orange-100'; // สีส้มอ่อน
      textColor = 'text-orange-800'; // สีส้มเข้ม
      break;
    default:
      break;
  }

  return (
    <div className={`flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-lg h-8 px-4 ${bgColor} ${textColor} text-sm font-medium leading-normal w-full`}>
      <span className="truncate">{status}</span>
    </div>
  );
};

export default StatusBadge;