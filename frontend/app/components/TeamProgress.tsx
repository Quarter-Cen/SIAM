'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

// ---------------------------------------------------
// Interfaces
// ---------------------------------------------------

interface DecodedToken {
  sub: string;
  role: "student" | "teacher";
  exp: number;
}

interface UserData {
  tid: string;
  name: string;
}

// 🛑 ปรับแก้: ลบ imageUrl ออกจาก Team interface
interface Team {
  teamid: string;
}

interface TeamCardProps {
  teamid: string;
}

// ---------------------------------------------------
// TeamCard Component (ปรับปรุงการแสดงผล)
// ---------------------------------------------------

// 🛑 ปรับแก้: รับแค่ teamid เป็น props
const TeamCard: React.FC<TeamCardProps> = ({ teamid }) => {
  // 💡 Logic เพื่อดึงแค่ตัวเลข (เผื่อ teamid เป็น 'T01' หรือ '01')
  // ถ้า teamid เป็นตัวเลขอยู่แล้ว ก็จะใช้ตัวเลขนั้น
  const teamNumber = teamid.replace(/\D/g, ''); 

  return (
    // ปรับ Tailwind: ให้ความยืดหยุ่นน้อยลง เพื่อเน้นวงกลม
    <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40 transition-transform duration-200 hover:scale-105">
      
      {/* 🛑 ส่วนของวงกลมและตัวเลข */}
      <div
        className="w-full aspect-square rounded-full flex items-center justify-center 
                   bg-blue-600 text-white shadow-lg border-4 border-blue-200"
      >
        {/* 🛑 ขนาดตัวอักษรใหญ่และหนา เพื่อให้ตัวเลขทีมเด่นชัด */}
        <p className="text-4xl font-extrabold">{teamNumber}</p>
      </div>

      {/* 🛑 ส่วนของข้อความใต้ Card */}
      <div>
        <p className="text-[#111418] text-base font-medium leading-normal text-center">
          ทีมที่ {teamid}
        </p>
      </div>
    </div>
  );
};

// ---------------------------------------------------
// TeamProgress Component
// ---------------------------------------------------

export default function TeamProgress() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const router = useRouter();

  // 1. Fetch User Data / Check Token (โค้ดเดิม)
  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const decoded: DecodedToken = jwtDecode(token);
        const userID = decoded.sub;
        const response = await axios.get<UserData>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/permission/get-teacher-profile/${userID}`
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data or decoding token:", error);
        router.push("/");
      }
    }
    fetchUserData();
  }, [router]);

  // 2. Fetch Team Progress (ปรับแก้ Logic)
  useEffect(() => {
    if (userData) {
      const fetchTeamProgress = async () => {
        try {
          const response = await axios.get<Team[]>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topics/team-progress/${userData.tid}`
          );
          
          // 🛑 ลบ Logic การ map เพื่อสร้าง teamsWithImages ออก
          setTeams(response.data); 
          
          console.log(response.data);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch team progress:", err);
          setError("Failed to load team data. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      fetchTeamProgress();
    }
  }, [userData]);

  // 3. Render Status (Loading, Empty, Error - โค้ดเดิม)
  if (loading) {
    return (
      <>
        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          ความคืบหน้าของกลุ่ม
        </h2>
        <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="p-4 text-center text-gray-500">
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </>
    );
  }

  if (teams.length === 0) {
    return (
      <>
        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          ความคืบหน้าของกลุ่ม
        </h2>
        <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="p-4 text-center text-gray-500">
            <p>ไม่มีข้อมูลความคืบหน้าของทีม</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          ความคืบหน้าของกลุ่ม
        </h2>
        <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="p-4 text-center text-red-500">
            <p>เกิดข้อผิดพลาดในการดึงข้อมูล: {error}</p>
          </div>
        </div>
      </>
    );
  }

  // 4. Render Success (ปรับแก้ props ที่ส่งให้ TeamCard)
  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        ความคืบหน้าของกลุ่ม
      </h2>
      <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-stretch p-4 gap-3">
          {teams.map((team, index) => (
            <Link href={`/my-teams/${team.teamid}`} key={team.teamid || index} passHref>
              <TeamCard
                teamid={team.teamid}
                // 🛑 ไม่ต้องส่ง imageUrl อีกต่อไป
              />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}