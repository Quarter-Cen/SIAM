"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Interfaces (No changes here, they are correct)
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

export default function ProjectOverview() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- 1. State ใหม่สำหรับจัดการ Edit Mode ---
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [editableGoal, setEditableGoal] = useState<string>("");

  const router = useRouter();

  // เมื่อกดปุ่ม "แก้ไข"
  const handleEditGoal = () => {
    if (projectData) {
      // ใช้งาน Optional Chaining และ Nullish Coalescing Operator เพื่อป้องกันค่า null/undefined
      setEditableGoal(projectData.goal ?? "");
      setIsEditingGoal(true);
    }
  };

  // เมื่อกดปุ่ม "ยกเลิก"
  const handleCancelEdit = () => {
    setIsEditingGoal(false); // ออกจากโหมดแก้ไข
    setEditableGoal(""); // ล้างค่าใน state ที่ใช้แก้ไข
  };

  // เมื่อกดปุ่ม "บันทึก"
  const handleSaveGoal = async () => {
    if (!userData) return;

    // --- เพิ่มโค้ดส่วนนี้ ---
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("Token not found. Redirecting to login.");
      router.push("/");
      return;
    }
    // -----------------------

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topics/overview/${userData.teamid}/goal`,
        { goal: editableGoal }, // ส่งข้อมูลใหม่ไปใน body
        {
          // --- เพิ่มโค้ดส่วนนี้ ---
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // -----------------------
        }
      );

      if (projectData) {
        setProjectData({ ...projectData, goal: editableGoal });
      }

      setIsEditingGoal(false);
      setError(null); // ล้าง error เมื่อบันทึกสำเร็จ
    } catch (err) {
      console.error("Failed to save the goal:", err);
      // แสดง error จาก server
      const serverErrorMessage =
        axios.isAxiosError(err) && err.response?.data?.detail
          ? err.response.data.detail
          : "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง";
      setError(serverErrorMessage);
    }
  };

  // --- useEffect 1: Fetch User Data (Runs once on component mount) ---
  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/");
        setLoading(false);
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        const userID = decoded.sub;

        const response = await axios.get<UserData>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/permission/get-student-profile/${userID}`
        );

        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data or decoding token:", error);
        router.push("/");
        setError("Failed to authenticate. Please log in again.");
      } finally {
        setLoading(true);
      }
    }

    fetchUserData();
  }, [router]);

  // --- useEffect 2: Fetch Project Data (Runs when userData changes) ---
  useEffect(() => {
    // This effect will only run if userData is NOT null
    if (userData) {
      const fetchProjectData = async () => {
        try {
          // Now we can safely access userData.teamid
          const response = await axios.get<ProjectData>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topics/overview/${userData.teamid}`
          );
          setProjectData(response.data);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch project data:", err);
          setError("Failed to load project data. Please try again later.");
          setProjectData(null);
        } finally {
          setLoading(false);
        }
      };

      fetchProjectData();
    } else {
      setLoading(false);
    }
  }, [userData]);

if (loading) {
  return (
    <>
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          {/* Skeleton สำหรับ Title */}
          <div className="bg-gray-200 rounded-md h-8 w-64 animate-pulse" />
          {/* Skeleton สำหรับสมาชิก */}
          <div className="bg-gray-200 rounded-md h-4 w-48 animate-pulse" />
        </div>
      </div>
      <h3 className="text-[#111418] text-[24px] font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        ภาพรวมโครงงาน
      </h3>
      <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
        {/* Skeleton สำหรับ อาจารย์ที่ปรึกษา */}
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dbe0e6] py-5">
          <div className="bg-gray-200 rounded-md h-4 w-32 animate-pulse" />
          <div className="bg-gray-200 rounded-md h-4 w-48 animate-pulse" />
        </div>
        {/* Skeleton สำหรับ วัตถุประสงค์ */}
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dbe0e6] py-5">
          <div className="bg-gray-200 rounded-md h-4 w-32 animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="bg-gray-200 rounded-md h-4 w-full animate-pulse" />
            <div className="bg-gray-200 rounded-md h-4 w-11/12 animate-pulse" />
            <div className="bg-gray-200 rounded-md h-4 w-10/12 animate-pulse" />
          </div>
        </div>
        {/* Skeleton สำหรับ ปีการศึกษา */}
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dbe0e6] py-5">
          <div className="bg-gray-200 rounded-md h-4 w-32 animate-pulse" />
          <div className="bg-gray-200 rounded-md h-4 w-24 animate-pulse" />
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

  if (!projectData) {
    return (
    <>
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          {/* Skeleton สำหรับ Title */}
          <div className="bg-gray-200 rounded-md h-8 w-64 animate-pulse" />
          {/* Skeleton สำหรับสมาชิก */}
          <div className="bg-gray-200 rounded-md h-4 w-48 animate-pulse" />
        </div>
      </div>
      <h3 className="text-[#111418] text-[24px] font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        ภาพรวมโครงงาน
      </h3>
      <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
        {/* Skeleton สำหรับ อาจารย์ที่ปรึกษา */}
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dbe0e6] py-5">
          <div className="bg-gray-200 rounded-md h-4 w-32 animate-pulse" />
          <div className="bg-gray-200 rounded-md h-4 w-48 animate-pulse" />
        </div>
        {/* Skeleton สำหรับ วัตถุประสงค์ */}
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dbe0e6] py-5">
          <div className="bg-gray-200 rounded-md h-4 w-32 animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="bg-gray-200 rounded-md h-4 w-full animate-pulse" />
            <div className="bg-gray-200 rounded-md h-4 w-11/12 animate-pulse" />
            <div className="bg-gray-200 rounded-md h-4 w-10/12 animate-pulse" />
          </div>
        </div>
        {/* Skeleton สำหรับ ปีการศึกษา */}
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dbe0e6] py-5">
          <div className="bg-gray-200 rounded-md h-4 w-32 animate-pulse" />
          <div className="bg-gray-200 rounded-md h-4 w-24 animate-pulse" />
        </div>
      </div>
    </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">
            {projectData.title}
          </p>
          <p className="text-[#60758a] text-sm font-normal leading-normal">
            สมาชิก: {projectData.team.map((member) => member).join(", ")}
          </p>
        </div>
      </div>
      <h3 className="text-[#111418] text-[24px] font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        ภาพรวมโครงงาน
      </h3>
      <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dbe0e6] py-5">
          <p className="text-[#60758a] text-sm font-normal leading-normal">
            อาจารย์ที่ปรึกษา
          </p>
          <p className="text-[#111418] text-sm font-normal leading-normal">
            {projectData.advisors.map((advisor) => advisor).join(", ")}
          </p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dbe0e6] py-5">
          <p className="text-[#60758a] text-sm font-normal leading-normal">
            วัตถุประสงค์
          </p>

          {/* --- 3. Conditional Rendering สำหรับส่วนวัตถุประสงค์ --- */}
          {isEditingGoal ? (
            // --- โหมดแก้ไข (Edit Mode) ---
            <div>
              <textarea
                value={editableGoal}
                onChange={(e) => setEditableGoal(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-950"
                rows={4}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveGoal}
                  className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  บันทึก
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          ) : (
            // --- โหมดแสดงผล (Display Mode) ---
            <div className="flex justify-between items-start">
              <p className="text-[#111418] text-sm font-normal leading-normal whitespace-pre-wrap">
                {projectData.goal}
              </p>
              <button
                onClick={handleEditGoal}
                className="text-blue-600 hover:underline text-sm ml-4"
              >
                แก้ไข
              </button>
            </div>
          )}
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
    </>
  );
}
