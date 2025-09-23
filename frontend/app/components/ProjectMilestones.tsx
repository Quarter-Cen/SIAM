"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FileDoc, Pencil, Code, Presentation } from '@phosphor-icons/react';

// Interfaces
interface MilestoneData {
  pjid: number;
  proposal: string | null;
  research_doc: string | null;
  proposal_slide: string | null;
  final_slide_project: string | null;
}

interface Milestone {
  name: string;
  date: string | null;
  icon: React.ReactNode;
}

const formatThaiDate = (isoString: string | null): string => {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return new Intl.DateTimeFormat("th-TH", options).format(date);
  } catch (error) {
    return "วันที่ไม่ถูกต้อง";
  }
};

export default function ProjectMilestones() {
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        setError("กรุณาเข้าสู่ระบบ");
        return;
      }
      try {
        const milestonesResponse = await axios.get<MilestoneData>(
          `http://127.0.0.1:8000/api/milestones/`,
          { headers: { Authorization: `Bearer ${token}` } } // เพิ่ม headers เพื่อส่ง token
        ); 
        
        const data = milestonesResponse.data;
        
        if (data) {
          const transformedMilestones: Milestone[] = [
            { name: 'Project Proposal Submission', date: formatThaiDate(data.proposal), icon: <FileDoc size={24} /> },
            { name: 'Research Document Submission', date: formatThaiDate(data.research_doc), icon: <Pencil size={24} /> },
            { name: 'Proposal Slide Presentation', date: formatThaiDate(data.proposal_slide), icon: <Code size={24} /> },
            { name: 'Final Project Presentation', date: formatThaiDate(data.final_slide_project), icon: <Presentation size={24} /> },
          ];
          setMilestones(transformedMilestones);
        } else {
          setMilestones([]);
        }
      } catch (err) {
        console.error("Failed to fetch milestones:", err);
        setError("ไม่สามารถดึงข้อมูล Milestones ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, []);

  if (loading) {
    // โค้ด Skeleton UI
    return (
      <>
        <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Project Milestones
        </h3>
        <div className="grid grid-cols-[40px_1fr] gap-x-2 px-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="contents animate-pulse">
              <div className="flex flex-col items-center gap-1 pt-3">
                <div className="bg-gray-200 rounded-md h-6 w-6" />
                {index < 3 && <div className="w-[1.5px] bg-[#dbe0e6] h-2 grow" />}
              </div>
              <div className="flex flex-1 flex-col py-3">
                <div className="bg-gray-200 rounded-md h-4 w-48 mb-2" />
                <div className="bg-gray-200 rounded-md h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500"><p>เกิดข้อผิดพลาด: {error}</p></div>;
  }

  if (!milestones || milestones.length === 0) {
    return <div className="p-4 text-center text-gray-500"><p>ไม่พบข้อมูล Milestones สำหรับโปรเจกต์นี้</p></div>;
  }

  return (
    <>
      <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Project Milestones
      </h3>
      <div className="grid grid-cols-[40px_1fr] gap-x-2 px-4">
        {milestones.map((milestone, index) => (
          <div key={index} className="contents">
            <div className="flex flex-col items-center gap-1 pt-3">
              <div className="text-[#111418]">{milestone.icon}</div>
              {index < milestones.length - 1 && <div className="w-[1.5px] bg-[#dbe0e6] h-2 grow" />}
            </div>
            <div className="flex flex-1 flex-col py-3">
              <p className="text-[#111418] text-base font-medium leading-normal">{milestone.name}</p>
              <p className="text-[#60758a] text-base font-normal leading-normal">{milestone.date}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}