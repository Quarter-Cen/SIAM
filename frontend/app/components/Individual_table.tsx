'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Interfaces for API response
interface OverallSummary {
 overall_completion_rate: string;
}

interface PerformanceByPerson {
 name: string;
 tasks_assigned: number;
 hours_spent: number;
 estimated_hours: number;
 tasks_done: number;
 completion_rate: string;
 efficiency: string;
 participation_rate: string;
}

interface DashboardResponseData {
 data: {
  overall_summary: OverallSummary;
  performance_by_person: PerformanceByPerson[];
 };
}

interface DecodedToken {
 sub: string;
 role: "student" | "teacher";
 exp: number;
}

interface UserData {
 sid: string;
 name: string;
 teamid: string;
 ajdv_pm_sheet: string;
}

const IndividualPerformance: React.FC = () => {
 const [performanceData, setPerformanceData] = useState<PerformanceByPerson[] | null>(null);
 const [loading, setLoading] = useState<boolean>(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const fetchIndividualPerformance = async () => {
   const token = localStorage.getItem("access_token");
   if (!token) {
    setLoading(false);
    setError("Authentication token not found. Please log in.");
    return;
   }

   try {
    const decoded: DecodedToken = jwtDecode(token);
    const userId = decoded.sub;

    // Step 1: Fetch user's profile to get teamid
    const userResponse = await axios.get<UserData>(
     `${process.env.NEXT_PUBLIC_API_BASE_URL}/permission/get-student-profile-for-sheet/${userId}`,
     { headers: { Authorization: `Bearer ${token}` } }
    );
    const teamId = userResponse.data.ajdv_pm_sheet;

    // Step 2: Fetch dashboard data using teamid
    const dashboardResponse = await axios.get<any>(
     `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/scrum/stat/${teamId}`,
     { headers: { Authorization: `Bearer ${token}` } }
    );

    const apiData = dashboardResponse.data.data;
    if (apiData && apiData.length > 0) {
     setPerformanceData(apiData[0].data.performance_by_person);
    } else {
     setError("No performance data found for this team.");
    }
   } catch (err) {
    console.error("Failed to fetch performance data:", err);
    setError("Failed to load individual performance data.");
   } finally {
    setLoading(false);
   }
  };

  fetchIndividualPerformance();
 }, []);

 if (loading) {
  return (
   <div className="px-4 py-3 @container animate-pulse">
    <div className="rounded-xl border border-[#dbe1e6] bg-white p-4">
     <div className="bg-gray-200 h-6 w-1/3 rounded-md mb-4" />
     <div className="space-y-4">
      <div className="h-16 bg-gray-200 rounded-md" />
      <div className="h-16 bg-gray-200 rounded-md" />
      <div className="h-16 bg-gray-200 rounded-md" />
     </div>
    </div>
   </div>
  );
 }

 if (error) {
  return (
   <div className="p-4 text-center text-red-500">
    <p>เกิดข้อผิดพลาด: {error}</p>
   </div>
  );
 }

 if (!performanceData || performanceData.length === 0) {
  return (
   <div className="p-4 text-center text-gray-500">
    ไม่พบข้อมูลสมาชิกในทีม
   </div>
  );
 }
 
 return (
  <>
   <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
    Individual Performance
   </h2>
   <div className="px-4 py-3 @container">
    <div className="flex overflow-hidden rounded-xl border border-[#dbe1e6] bg-white">
     <table className="flex-1">
      <thead>
       <tr className="bg-white">
        <th className="px-4 py-3 text-left text-[#111518] text-sm font-medium leading-normal w-[20%]">
         ชื่อ
        </th>
        <th className="px-4 py-3 text-left text-[#111518] text-sm font-medium leading-normal w-[15%]">
         งานที่เสร็จ
        </th>
        <th className="px-4 py-3 text-left text-[#111518] text-sm font-medium leading-normal w-[15%]">
         ที่ทำไป
        </th>
        <th className="px-4 py-3 text-left text-[#111518] text-sm font-medium leading-normal w-[15%]">
         ที่ประมาณการ
        </th>
        <th className="px-4 py-3 text-left text-[#111518] text-sm font-medium leading-normal w-[15%]">
         ประสิทธิภาพ
        </th>
        <th className="px-4 py-3 text-left text-[#111518] text-sm font-medium leading-normal w-[20%]">
         ภาพรวมการมีส่วนร่วม
        </th>
       </tr>
      </thead>
      <tbody>
       {performanceData.map((member, index) => {
        const participationRateValue = parseFloat(member.participation_rate.replace('%', ''));
        return (
         <tr key={index} className="border-t border-t-[#dbe1e6]">
          <td className="h-[72px] px-4 py-2 text-[#111518] text-sm font-normal leading-normal">
           {member.name}
          </td>
          <td className="h-[72px] px-4 py-2 text-[#60768a] text-sm font-normal leading-normal">
           {member.tasks_done}
          </td>
          <td className="h-[72px] px-4 py-2 text-[#60768a] text-sm font-normal leading-normal">
           {member.hours_spent}
          </td>
          <td className="h-[72px] px-4 py-2 text-[#60768a] text-sm font-normal leading-normal">
           {member.estimated_hours}
          </td>
          <td className="h-[72px] px-4 py-2 text-[#60768a] text-sm font-normal leading-normal">
           {member.efficiency}
          </td>
          <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal">
           <div className="flex items-center gap-3">
            <div className="w-[88px] overflow-hidden rounded-sm bg-[#dbe1e6]">
             <div
              className="h-1 rounded-full bg-[#111518]"
              style={{ width: `${participationRateValue}%` }}
             ></div>
            </div>
            <p className="text-[#111518] text-sm font-medium leading-normal">
             {member.participation_rate}
            </p>
           </div>
          </td>
         </tr>
        );
       })}
      </tbody>
     </table>
    </div>
   </div>
  </>
 );
};

export default IndividualPerformance;