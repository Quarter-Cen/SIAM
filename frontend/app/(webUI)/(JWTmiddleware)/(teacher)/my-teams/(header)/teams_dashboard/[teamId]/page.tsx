"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DashboardSection from "@/app/components/DashboardSection";
import ProgressCard from "@/app/components/ProgressCard";
import DailyBarChart from "@/app/components/DailyBarChart";
import { useParams } from "next/navigation";

// Interfaces สำหรับ API
interface OverallSummary {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  moved_tasks: number;
  total_estimated_hours: number;
  total_hours_spent: number;
  overall_completion_rate: string;
  overall_efficiency: string;
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

interface DailyData {
  day: string;
  tasksDone: number;
}


interface UserData {
  teamid: string;
  ajdv_pm_sheet: string;
}



export default function DashboardPage() {
  const { teamId } = useParams<{ teamId: string }>();  // ✅ ใช้ตรงนี้

  const [overallSummary, setOverallSummary] = useState<OverallSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[] | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceByPerson[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [addjust, setAddjust] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setError("ไม่พบ Team ID");
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("ไม่พบการยืนยันตัวตน กรุณาเข้าสู่ระบบใหม่");
        setLoading(false);
        return;
      }

      try {
        // ขั้นตอนที่ 1: ดึง teamid ของผู้ใช้
        const userResponse = await axios.get<UserData>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/permission/get-team-profile-for-sheet/${teamId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sheetTeamId = userResponse.data.ajdv_pm_sheet;

        // ขั้นตอนที่ 2: ดึงข้อมูล Dashboard จาก teamId ที่ได้มา
        const dashboardResponse = await axios.get<any>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/scrum/stat/${sheetTeamId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const apiData = dashboardResponse.data.data;
        const defaultTeamId = userResponse.data.teamid;

        const suggestionsResponse = await axios.get<any>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/scrum/suggestions/${defaultTeamId}`
        );

        if (apiData && apiData.length > 0) {
          const summary = apiData[0].data.overall_summary;
          const daily = apiData
            .filter((item: { day: any }) => item.day)
            .map((item: { day: any; tasksDone: any }) => ({
              day: item.day,
              tasksDone: item.tasksDone,
            }));
          const performance = apiData[0].data.performance_by_person;

          setSuggestion(suggestionsResponse.data.recommendations);
          setAddjust(suggestionsResponse.data.additional_work);
          setOverallSummary(summary);
          setDailyData(daily);
          setPerformanceData(performance);
        } else {
          setError("ไม่พบข้อมูล Dashboard");
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("ไม่สามารถดึงข้อมูล Dashboard ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [teamId]);
  // ส่วนของการแสดงผลการโหลด
  if (loading) {
    return (
      <div className="px-4 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex flex-col gap-4 p-4 animate-pulse">
            <div className="bg-gray-200 h-8 w-60 rounded-md" />
            <div className="bg-gray-200 h-40 w-full rounded-md" />
            <div className="flex gap-4">
              <div className="bg-gray-200 h-24 w-full rounded-md" />
              <div className="bg-gray-200 h-24 w-full rounded-md" />
              <div className="bg-gray-200 h-24 w-full rounded-md" />
            </div>
          </div>
          <div className="flex flex-col gap-4 p-4 animate-pulse">
            <div className="bg-gray-200 h-8 w-48 rounded-md" />
            <div className="flex gap-4">
              <div className="bg-gray-200 h-64 w-full rounded-md" />
              <div className="bg-gray-200 h-64 w-full rounded-md" />
            </div>
          </div>
          <div className="flex flex-col gap-4 p-4 animate-pulse">
            <div className="bg-gray-200 h-8 w-56 rounded-md" />
            <div className="bg-gray-200 h-40 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  }

  if (!overallSummary || !dailyData || !performanceData) {
    return (
      <div className="p-4 text-center text-gray-500">
        ไม่พบข้อมูล Dashboard สำหรับทีมนี้
      </div>
    );
  }

  const daysLabels = dailyData.map((item) => item.day);
  const tasksDoneData = dailyData.map((item) => item.tasksDone);
  const totalMembers = performanceData.length;

  return (
    <>
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <DashboardSection title="Current Project Status">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex gap-6 justify-between">
                <p className="text-[#121416] text-base font-medium leading-normal">
                  ภาพรวมความคืบหน้าโครงงาน
                </p>
                <p className="text-[#121416] text-sm font-normal leading-normal">
                  {overallSummary.overall_completion_rate}
                </p>
              </div>
              <div className="rounded bg-[#dde1e3]">
                <div
                  className="h-2 rounded bg-[#121416]"
                  style={{ width: overallSummary.overall_completion_rate }}
                ></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 p-4">
              <ProgressCard
                title="งานเสร็จสมบูรณ์"
                value={`${overallSummary.completed_tasks}/${overallSummary.total_tasks}`}
              />
              <ProgressCard title="สมาชิก" value={`${totalMembers}`} />
              <ProgressCard title="ระยะเวลาโครงงาน" value="16 สัปดาห์" />
            </div>
          </DashboardSection>

          <DashboardSection title="Team Performance">
            <div className="flex flex-wrap gap-4 px-4 py-6">
              <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[#dde1e3] p-6">
                <p className="text-[#121416] text-base font-medium leading-normal">
                  อัตราความสำเร็จของงาน
                </p>
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight truncate">
                  {overallSummary.overall_completion_rate}
                </p>
                <div className="flex gap-1">
                  <p className="text-[#6a7681] text-base font-normal leading-normal">
                    รวม
                  </p>
                </div>
                <DailyBarChart data={tasksDoneData} labels={daysLabels} />
              </div>
              <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[#dde1e3] p-6">
                <p className="text-[#121416] text-base font-medium leading-normal">
                  ประสิทธิภาพโดยรวม
                </p>
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight truncate">
                  {overallSummary.overall_efficiency}
                </p>
                <p className="text-[#6a7681] text-base font-normal leading-normal">
                  ประสิทธิภาพโดยรวมของทีม
                </p>

                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-[#121416] text-base font-medium leading-normal">
                    งานที่ประมาณการ vs. งานที่ทำไป
                  </p>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight truncate">
                        {overallSummary.total_estimated_hours}
                      </p>
                      <p className="text-[#6a7681] text-base font-normal leading-normal">
                        ประมาณการ
                      </p>
                    </div>
                    <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight truncate">
                      /
                    </p>
                    <div className="flex flex-col">
                      <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight truncate">
                        {overallSummary.total_hours_spent}
                      </p>
                      <p className="text-[#6a7681] text-base font-normal leading-normal">
                        ที่ทำไป
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DashboardSection>
          <DashboardSection title="ข้อเสนอแนะสำหรับโครงงาน">
            <div className="flex flex-wrap gap-4 px-4 py-6">
              <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[#dde1e3] p-6">
                <p className="text-[#121416] text-base font-bold leading-normal text-[18px]">
                  คำแนะนำจากงานของรุ่นพี่
                </p>
                <p className="text-[#121416] tracking-light font-medium leading-tight pt-1">
                  {suggestion}
                </p>
                <p className="text-[#121416] text-base font-bold leading-normal text-[18px] pt-6">
                  แนวคิดเพิ่มเติม
                </p>
                <p className="text-[#121416] tracking-light font-medium leading-tight pt-1">
                  {addjust}
                </p>
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </>
  );
}
