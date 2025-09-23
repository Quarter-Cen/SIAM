import React from 'react';

interface DailyBarChartProps {
  data: number[];
  labels: string[];
}

const DailyBarChart: React.FC<DailyBarChartProps> = ({ data, labels }) => {
  if (data.length !== labels.length) {
    console.error("Data and labels arrays must have the same length.");
    return null;
  }

  const maxData = Math.max(...data);

  return (
    <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
      {data.map((value, index) => (
        <React.Fragment key={index}>
          <div
            className="border-[#6a7681] bg-[#f1f2f4] border-t-2 w-full"
            style={{ height: `${(value / maxData) * 100}%` }}
          />
          <p className="text-[#6a7681] text-[13px] font-bold leading-normal tracking-[0.015em]">{labels[index]}</p>
        </React.Fragment>
      ))}
    </div>
  );
};

export default DailyBarChart;