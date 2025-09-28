"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProjectMilestones from "@/app/components/ProjectMilestones"
import axios from "axios";
// import { jwtDecode } from "jwt-decode"; // Removed due to compilation error
import Link from "next/link";
import { FileDoc, Pencil, Code, Presentation } from "@phosphor-icons/react";
// ----------------------------------------------------
// Interfaces
// ----------------------------------------------------

interface Member {
  sid: string;
}

interface Advisor {
  name: string;
}

interface ProjectData {
  title: string;
  team: Member[];
  advisors: Advisor[];
  goal: string;
  year: string;
}

interface Document {
  did: number;
  doc_type: "proposal" | "slide-proposal" | "thesis" | "slide-final-present";
  name: string | null;
  stamp_at: string | null;
  status: "submitted" | "not-submitted" | "late";
}

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

// ----------------------------------------------------
// Helper Functions
// ----------------------------------------------------

// Custom function to decode JWT without an external library
const jwtDecode = <T extends object>(token: string): T => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
};

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

const getDocumentDisplayName = (docType: string): string => {
  switch (docType) {
    case "proposal":
      return "เอกสารข้อเสนอโครงการ";
    case "slide-proposal":
      return "สไลด์นำเสนอข้อเสนอโครงการ";
    case "thesis":
      return "เอกสารปริญญานิพนธ์ฉบับสมบูรณ์";
    case "slide-final-present":
      return "สไลด์นำเสนอฉบับสมบูรณ์";
    default:
      return docType;
  }
};

const getStatusDisplayName = (
  status: "submitted" | "not-submitted" | "late"
): string => {
  switch (status) {
    case "submitted":
      return "ส่งแล้ว";
    case "not-submitted":
      return "ยังไม่ส่ง";
    case "late":
      return "ส่งล่าช้า";
    default:
      return status;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = "bg-gray-200";
  let textColor = "text-gray-800";
  if (status === "ส่งแล้ว") {
    bgColor = "bg-green-100";
    textColor = "text-green-800";
  } else if (status === "ยังไม่ส่ง") {
    bgColor = "bg-red-100";
    textColor = "text-red-800";
  } else if (status === "ส่งล่าช้า") {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-800";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${bgColor} ${textColor}`}
    >
      {status}
    </span>
  );
};

// Component สำหรับแสดงรายละเอียดโปรเจกต์
const ProjectOverview = ({ teamId }: { teamId: string }) => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }
    const fetchProjectData = async () => {
      try {
        const response = await axios.get<ProjectData>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topics/overview/${teamId}`
        );
        console.log(response.data);
        setProjectData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load project data. Please try again later.");
        setProjectData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          <div className="bg-gray-200 rounded-md h-8 w-64 animate-pulse" />
          <div className="bg-gray-200 rounded-md h-4 w-48 animate-pulse" />
        </div>
        <div className="bg-gray-200 rounded-md h-24 w-full animate-pulse" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }
  if (!projectData) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>ไม่พบข้อมูลโครงงาน</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">
            {projectData.title}
          </p>
          <p className="text-[#60758a] text-sm font-normal leading-normal">
            สมาชิก:{" "}
            {projectData.team
              .map((member: any) =>
                typeof member === "string" ? member : member.sid
              )
              .join(", ")}
          </p>
        </div>
      </div>
      <h3 className="text-[#111418] text-[24px] font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
        ภาพรวมโครงงาน
      </h3>
      <div className="grid grid-cols-[20%_1fr] gap-x-6">
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dbe0e6] py-5">
          <p className="text-[#60758a] text-sm font-normal leading-normal">
            อาจารย์ที่ปรึกษา
          </p>
          <p className="text-[#111418] text-sm font-normal leading-normal">
            {projectData.advisors
              .map((advisor: any) =>
                typeof advisor === "string" ? advisor : advisor.name
              )
              .join(", ")}
          </p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dbe0e6] py-5">
          <p className="text-[#60758a] text-sm font-normal leading-normal">
            วัตถุประสงค์
          </p>

          <div className="flex justify-between items-start">
            <p className="text-[#111418] text-sm font-normal leading-normal whitespace-pre-wrap">
              {projectData.goal}
            </p>
          </div>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dbe0e6] py-5">
          <p className="text-[#60758a] text-sm font-normal leading-normal">
            ปีการศึกษา
          </p>
          <p className="text-[#111418] text-sm font-normal leading-normal">
            {projectData.year}
          </p>
        </div>
      </div>
    </div>
  );
};

// Component สำหรับแสดงเอกสารล่าสุด
const RecentDocuments = ({ teamId }: { teamId: string }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันสำหรับดึงข้อมูลเอกสารทั้งหมด
  const fetchDocuments = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      setError("ไม่พบการยืนยันตัวตน กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    try {
      const docsResponse = await axios.get<Document[]>(
        `http://127.0.0.1:8000/api/documents/${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const sortOrder = new Map([
          ["proposal", 1],                // ข้อเสนอ
          ["slide-proposal", 2],          // สไลด์ข้อเสนอ
          ["thesis", 3],                  // เล่มจบ
          ["slide-final-present", 4],     // สไลด์จบ
      ]);

      const sortedDocuments = docsResponse.data.sort((a, b) => {
          const orderA = sortOrder.get(a.doc_type) || 99;
          const orderB = sortOrder.get(b.doc_type) || 99;
          return orderA - orderB;
      });

      setDocuments(sortedDocuments);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลเอกสารได้");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับอัปเดตสถานะ
  const updateStatus = async (docId: number, newStatus: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("ไม่พบการยืนยันตัวตน กรุณาเข้าสู่ระบบใหม่");
      return; 
    }

    // แสดงสถานะ loading เพื่อให้ผู้ใช้รู้ว่ากำลังทำงาน
    setLoading(true);

    try {
      await axios.patch<Document>(
        `http://127.0.0.1:8000/api/documents/${docId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // เมื่ออัปเดตสำเร็จ ให้เรียก fetchDocuments() เพื่อดึงข้อมูลล่าสุดทั้งหมด
      await fetchDocuments();
      
    } catch (err) {
      setError("ไม่สามารถอัปเดตสถานะเอกสารได้");
    } finally {
      // ซ่อน loading เมื่อการทำงานเสร็จสิ้น ไม่ว่าจะสำเร็จหรือผิดพลาด
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }
    fetchDocuments();
  }, [teamId]);

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
          เอกสาร
        </h3>
        <div className="flex flex-col gap-3">
          <div className="bg-gray-200 rounded-md h-12 w-full animate-pulse" />
          <div className="bg-gray-200 rounded-md h-12 w-full animate-pulse" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }
  return (
    <div className="p-4">
      <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
        เอกสาร
      </h3>
      <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
        <table className="flex-1">
          <thead>
            <tr className="bg-white">
              <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                ชื่อเอกสาร
              </th>
              <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                การปรับปรุงล่าสุด
              </th>
              <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                สถานะ
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.length > 0 ? (
              documents.map((doc, index) => (
                <tr key={index} className="border-t border-t-[#dbe0e6]">
                  <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                    {getDocumentDisplayName(doc.doc_type)}
                  </td>
                  <td className="h-[72px] px-4 py-2 text-[#60758a] text-sm font-normal leading-normal">
                    {formatThaiDate(doc.stamp_at)}
                  </td>
                  <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal">
                    <StatusBadge status={getStatusDisplayName(doc.status)} />
                  </td>
                  <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(doc.did, "submitted")}
                        className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-300"
                      >
                        ส่งแล้ว
                      </button>
                      <button
                        onClick={() => updateStatus(doc.did, "not-submitted")}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-300"
                      >
                        ยังไม่ส่ง
                      </button>
                      <button
                        onClick={() => updateStatus(doc.did, "late")}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-300"
                      >
                        ส่งล่าช้า
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-t-[#dbe0e6]">
                <td
                  colSpan={3}
                  className="h-[72px] px-4 py-2 text-center text-gray-500"
                >
                  ไม่พบเอกสาร
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};  



// ----------------------------------------------------
// Main Application Component
// ----------------------------------------------------
// Component หลักที่ทำหน้าที่เป็น "หน้าเดียว" ของแอป
export default function App() {
  const { teamId } = useParams<{ teamId: string }>();

  if (!teamId) {
    return <div className="p-4 text-center text-gray-500">ไม่พบ Team ID</div>;
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="mt-6 flex justify-end">
        <Link
          href={`/my-teams/teams_dashboard/${teamId}`}
          className="inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-blue-700 active:scale-95 transition"
        >
          ไปที่ Teams Dashboard
        </Link>
      </div>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <ProjectOverview teamId={teamId} />
            <RecentDocuments teamId={teamId} />
            <ProjectMilestones />
          </div>
        </div>
      </div>
    </div>
  );
}
