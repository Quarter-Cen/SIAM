"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Link from "next/link";

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

const Header = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    console.log("User logged out!");
    router.push("/");
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        // Redirect to login if no token is found
        router.push("/");
        setLoading(false); // Make sure to stop loading state
        return;
      }

      try {
        setLoading(true);
        // Decode the token to get the user ID
        const decoded: DecodedToken = jwtDecode(token);
        const userID = decoded.sub;

        // Fetch user data from your FastAPI backend
        const response = await axios.get<UserData>(
          `http://127.0.0.1:8000/permission/get-student-profile/${userID}`
        );

        // Update state with the fetched data
        setUserData(response.data);
      } catch (error) {
        // Handle errors in a more robust way, e.g., redirect to login on token expiration
        console.error("Error fetching user data or decoding token:", error);
        // Maybe the token is expired, so redirect to login
        router.push("/");
        setUserData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]); // Dependency on `router` to ensure the effect is stable

  return (
<header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f1f2f4] px-10 py-3">
  {/* ส่วนที่ 1: โลโก้ (ซ้าย) */}
  <div className="flex items-center gap-4 text-[#121416]">
    <h2 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em]">
      SIAM
    </h2>
  </div>

  {/* ส่วนที่ 2: เมนู (กลาง) */}
  <div className="flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
    <Link href="/my-project" passHref>
      <p className="text-[#121416] text-sm font-medium leading-normal">
        My Project
      </p>
    </Link>
    <Link href="/dashboard" passHref>
      <p className="text-[#121416] text-sm font-medium leading-normal">
        Dashboard
      </p>
    </Link>
  </div>

  {/* ส่วนที่ 3: ข้อมูลผู้ใช้และปุ่ม (ขวา) */}
  <div className="flex items-center gap-9">
    {/* Conditional rendering สำหรับข้อมูลผู้ใช้ */}
    {loading ? (
      <p>Loading...</p>
    ) : userData ? (
      <>
        <p className="text-[#121416] text-sm font-medium leading-normal">
          {userData.sid}
        </p>
        <p className="text-[#121416] text-sm font-medium leading-normal">
          {userData.name}
        </p>
        <p className="text-[#121416] text-sm font-medium leading-normal">
          กลุ่มที่ {userData.teamid}
        </p>
      </>
    ) : (
      <p>Could not load user data.</p>
    )}

    {/* ปุ่มและ Dropdown สำหรับรูปโปรไฟล์ */}
    <div className="relative">
      <button
        onClick={handleToggleDropdown}
        className="rounded-full overflow-hidden w-10 h-10 cursor-pointer focus:outline-none"
      >
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC0tJ6zzXD4RwWXX20YXmuRoMuF7qEvyXVwQw4RMD9UZhCgPl2ZNs-zGhpdUt3xv3Xn4ohSfeT9ORrcaNh3UKthCE1OSPYq_iYkzmwcbfvgaIb9fKqrSv3BPZH1uWnSIUcLQAzhFCFTyWl2AmlGdhDgG9yZlq0C5b76_povdgpky4RO0UQ7wdPVqVthSIE_Pu6gJ1tVS2W0vatzbFpS2QZlrwPogad723miBoumC-p0ubBIh8CfKinSg83l2RvqcBGNGkrEa9jduQ")',
          }}
        ></div>
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hover:bg-gray-100">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  </div>
</header>
  );
};

export default Header;
