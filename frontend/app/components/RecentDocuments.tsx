"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import StatusBadge from "./StatusBadge";

// Interfaces
interface Document {
  did: number;
  doc_type: "proposal" | "slide-proposal" | "thesis" | "slide-final-present";
  name: string | null;
  stamp_at: string | null;
  status: "submitted" | "not-submitted" | "late";
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
}

// Helper function สำหรับแปลง doc_type เป็นชื่อที่สื่อความหมาย
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

// Helper function สำหรับแปลง status เป็นชื่อที่สื่อความหมาย
const getStatusDisplayName = (status: "submitted" | "not-submitted" | "late"): string => {
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

export default function RecentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateTime = (isoString: string | null): string => {
    if (!isoString) {
      return "-";
    }
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
      console.error("Invalid date string:", isoString);
      return "วันที่ไม่ถูกต้อง";
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        setError("ไม่พบการยืนยันตัวตน กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        const userId = decoded.sub;

        const userResponse = await axios.get<UserData>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/permission/get-student-profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const teamId = userResponse.data.teamid;

        const docsResponse = await axios.get<Document[]>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/documents/${teamId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDocuments(docsResponse.data);

      } catch (err) {
        console.error("Failed to fetch documents:", err);
        setError("ไม่สามารถดึงข้อมูลเอกสารได้");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return (
<>
        <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          เอกสาร
        </h3>
        <div className="px-4 py-3 @container">
          <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
            <table className="flex-1">
              <thead>
                <tr className="bg-white">
                  <th className="table-column-1 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">ชื่อเอกสาร</th>
                  <th className="table-column-3 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">การปรับปรุงล่าสุด</th>
                  <th className="table-column-4 px-4 py-3 text-left text-[#111418] w-60 text-sm font-medium leading-normal">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {/* Skeleton UI สำหรับการโหลดข้อมูล */}
                {[...Array(4)].map((_, index) => (
                  <tr key={index} className="border-t border-t-[#dbe0e6] animate-pulse">
                    <td className="h-[72px] px-4 py-2 w-[400px]">
                      <div className="bg-gray-200 rounded h-4 w-48" />
                    </td>
                    <td className="h-[72px] px-4 py-2 w-[400px]">
                      <div className="bg-gray-200 rounded h-4 w-56" />
                    </td>
                    <td className="h-[72px] px-4 py-2 w-60">
                      <div className="bg-gray-200 rounded-full h-6 w-24" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>เกิดข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        เอกสาร
      </h3>
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                <th className="table-column-1 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">ชื่อเอกสาร</th>
                <th className="table-column-3 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">การปรับปรุงล่าสุด</th>
                <th className="table-column-4 px-4 py-3 text-left text-[#111418] w-60 text-sm font-medium leading-normal">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <tr key={index} className="border-t border-t-[#dbe0e6]">
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                      {/* เรียกใช้ helper function เพื่อแสดงชื่อเอกสารที่อ่านง่าย */}
                      {getDocumentDisplayName(doc.doc_type)}
                    </td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                      {formatDateTime(doc.stamp_at)}
                    </td>
                    <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      {/* ส่งค่า status ที่แปลงแล้วไปให้ StatusBadge */}
                      <StatusBadge status={getStatusDisplayName(doc.status) } />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-t-[#dbe0e6]">
                  <td colSpan={3} className="h-[72px] px-4 py-2 text-center text-gray-500">
                    ไม่พบเอกสาร
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}