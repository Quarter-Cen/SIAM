'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

interface DecodedToken {
  sub: string;
  role: "student" | "teacher";
  exp: number;
}

interface UserData {
  tid: string;
  name: string;
}

interface Team {
  teamid: string;
  imageUrl: string;
}

interface TeamCardProps {
  teamid: string;
  imageUrl: string;
}

const TeamCard: React.FC<TeamCardProps> = ({ teamid, imageUrl }) => {
  return (
    <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40 transition-transform duration-200 hover:scale-105">
      <div
        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col shadow-md"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      ></div>
      <div>
        <p className="text-[#111418] text-base font-medium leading-normal">
          Team {teamid}
        </p>
      </div>
    </div>
  );
};

export default function TeamProgress() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const router = useRouter();

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

  useEffect(() => {
    if (userData) {
      const fetchTeamProgress = async () => {
        try {
          const response = await axios.get<Team[]>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topics/team-progress/${userData.tid}`
          );
          const teamsWithImages = response.data.map((team) => ({
            ...team,
            imageUrl: `https://picsum.photos/seed/${team.teamid}/200/200`,
          }));

          setTeams(teamsWithImages);
          console.log(teamsWithImages);
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
                imageUrl={team.imageUrl}
              />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}