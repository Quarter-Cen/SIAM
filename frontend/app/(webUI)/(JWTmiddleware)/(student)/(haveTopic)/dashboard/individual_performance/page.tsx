

import Individual_table from "@/app/components/Individual_table";

import React from "react";


const sampleMembers = [
  {
    name: '66022365',
    tasksCompleted: 12,
    overallContribution: 75,
  },
  {
    name: '66022422',
    tasksCompleted: 10,
    overallContribution: 60,
  },

];
const DashboardPage: React.FC = () => {
  return (
    <>
          <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <Individual_table members={sampleMembers} />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
