"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { FileDoc, Pencil, Code, Presentation, X } from '@phosphor-icons/react';

// Interfaces
interface MilestoneData {
  pmid: number; 
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

// NEW Interface for Editable Milestone
interface EditableMilestone {
  pjid: number;
  fieldName: string; // ชื่อ Field ใน DB: 'proposal', 'research_doc', ฯลฯ
  currentDate: string | null;
  name: string;
}

const formatThaiDate = (isoString: string | null): string => {
  if (!isoString) return "-";
  
  // 🎯 แก้ไข: กำจัด Timezone Offset ออกเพื่อหลีกเลี่ยงปัญหาการตีความ
  let cleanString = isoString.replace(/(\+|-)\d{2}:\d{2}$/, ''); // ลบ +00:00 หรือ -XX:XX ออก

  try {
    // 💡 หากเป็น ISO 8601 ที่ไม่มี Timezone Offset แต่มี T (เวลา) ให้เติม 'Z' เพื่อบังคับให้เป็น UTC
    if (cleanString.endsWith('T')) {
        cleanString += '00:00:00Z'; // เติมเวลาเริ่มต้นและ Z
    } else if (!cleanString.endsWith('Z')) {
        cleanString += 'Z'; // ถ้าไม่มี Z ให้เพิ่ม Z เข้าไปเพื่อให้ตีความเป็น UTC
    }
    
    const date = new Date(cleanString);
    
    // 💡 เพิ่มการตรวจสอบความถูกต้องของ Date Object
    if (isNaN(date.getTime())) {
        throw new Error("Invalid Date Object");
    }

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
    console.error("Date formatting failed for:", isoString, error); // แสดง Error ใน Console
    return "วันที่ไม่ถูกต้อง";
  }
};

export default function ProjectMilestones() {
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pjid, setPjid] = useState<number | null>(null); 



  // 🎯 MODIFIED: fetchMilestones Function 🎯
  const fetchMilestones = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      setError("กรุณาเข้าสู่ระบบ");
      return;
    }
    
    try {
      // 2. เรียก API โดยส่ง User ID ไปเพื่อให้ Backend ค้นหา Project ID และ Milestones ที่เกี่ยวข้อง
      const milestonesResponse = await axios.get<MilestoneData>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/milestones/`, // 🛑 แก้ไข Endpoint ให้ส่ง userID 🛑
        { headers: { Authorization: `Bearer ${token}` } }
      ); 
      
      const data = milestonesResponse.data;
      console.log(data)
      if (data && data.pmid) {
        setPjid(data.pmid); 
        
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
      if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("ไม่พบข้อมูลโครงการที่เกี่ยวข้องกับผู้ใช้นี้");
      } else {
          setError("ไม่สามารถดึงข้อมูล Milestones ได้");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        {milestones.map((milestone, index) => {
          const fieldNames = ['proposal', 'research_doc', 'proposal_slide', 'final_slide_project'];
          const fieldName = fieldNames[index];
          
          return (
            <div key={index} className="contents">
              <div className="flex flex-col items-center gap-1 pt-3">
                <div className="text-[#111418]">{milestone.icon}</div>
                {index < milestones.length - 1 && <div className="w-[1.5px] bg-[#dbe0e6] h-2 grow" />}
              </div>
              <div className="flex flex-1 flex-col py-3">
                <div className="flex items-start">
                  <p className="text-[#111418] text-base font-medium leading-normal">{milestone.name}</p>
                </div>
                <p className="text-[#60758a] text-base font-normal leading-normal">{milestone.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}