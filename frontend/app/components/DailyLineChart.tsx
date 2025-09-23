import React from 'react';

interface DailyLineChartProps {
  data: number[];
  labels: string[];
}

const DailyLineChart: React.FC<DailyLineChartProps> = ({ data, labels }) => {
  if (data.length === 0 || data.length !== labels.length) {
    console.error("Data and labels arrays must be non-empty and have the same length.");
    return null;
  }

  const chartHeight = 148;
  const chartWidth = 472;
  const padding = 10;
  
  const yMax = Math.max(...data);
  const yMin = Math.min(...data);
  
  const yRange = yMax === yMin ? 1 : yMax - yMin;
  const xIncrement = (chartWidth - 2 * padding) / (data.length - 1);

  // Generate the SVG path for the line
  const linePath = data.map((value, index) => {
    const x = padding + index * xIncrement;
    const y = chartHeight - padding - ((value - yMin) / yRange) * (chartHeight - 2 * padding);
    return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
  }).join(' ');

  // Generate the SVG path for the shaded area
  const areaPath = `${linePath} L${padding + (data.length - 1) * xIncrement} ${chartHeight - padding} L${padding} ${chartHeight - padding}Z`;

  return (
    <div className="flex flex-col gap-2">
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <path
          d={areaPath}
          fill="url(#lineChartGradient)"
        ></path>
        <path
          d={linePath}
          stroke="#6a7681"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        ></path>
        <defs>
          <linearGradient id="lineChartGradient" x1="0" y1="0" x2="0" y2="100%" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f1f2f4"></stop>
            <stop offset="1" stopColor="#f1f2f4" stopOpacity="0"></stop>
          </linearGradient>
        </defs>
      </svg>
      <div className="flex justify-around">
        {labels.map((label, index) => (
          <p key={index} className="text-[#6a7681] text-[13px] font-bold leading-normal tracking-[0.015em]">
            {label}
          </p>
        ))}
      </div>
    </div>
  );
};

export default DailyLineChart;
