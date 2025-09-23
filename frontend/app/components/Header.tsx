'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface DecodedToken {
  sub: string;
  role: 'student' | 'teacher';
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

  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        // Redirect to login if no token is found
        router.push('/login');
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
        router.push('/login');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]); // Dependency on `router` to ensure the effect is stable

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f1f2f4] px-10 py-3">
      <div className="flex items-center gap-4 text-[#121416]">
        <h2 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em]">SIAM</h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-5">
          {loading ? (
            <p>Loading...</p>
          ) : userData ? (
            <>
              <p className="text-[#121416] text-sm font-medium leading-normal">{userData.sid}</p>
              <p className="text-[#121416] text-sm font-medium leading-normal">{userData.name}</p>
              <p className="text-[#121416] text-sm font-medium leading-normal">กลุ่มที่ {userData.teamid}</p>
            </>
          ) : (
            <p>Could not load user data.</p>
          )}
        </div>
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f1f2f4] text-[#121416] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
          <div className="text-[#121416]" data-icon="Bell" data-size="20px" data-weight="regular">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
          </div>
        </button>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC0tJ6zzXD4RwWXX20YXmuRoMuF7qEvyXVwQw4RMD9UZhCgPl2ZNs-zGhpdUt3xv3Xn4ohSfeT9ORrcaNh3UKthCE1OSPYq_iYkzmwcbfvgaIb9fKqrSv3BPZH1uWnSIUcLQAzhFCFTyWl2AmlGdhDgG9yZlq0C5b76_povdgpky4RO0UQ7wdPVqVthSIE_Pu6gJ1tVS2W0vatzbFpS2QZlrwPogad723miBoumC-p0ubBIh8CfKinSg83l2RvqcBGNGkrEa9jduQ")' }}
        ></div>
      </div>
    </header>
  );
};

export default Header;