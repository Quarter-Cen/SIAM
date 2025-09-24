'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import LoadingOverlay from './LoadingOverlay';
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

const IsHaveTopicLayout = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkTopicExistence() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // Redirect ทันทีถ้าไม่มี token
        router.push('/');
        return;
      }
      try {
        const decoded: DecodedToken = jwtDecode(token);
        const userID = decoded.sub; 

        const userResponse = await axios.get<UserData>(
          `http://127.0.0.1:8000/permission/get-student-profile/${userID}`
        );
        const teamID = userResponse.data.teamid;
        
        const topicResponse = await axios.get<boolean>(
          `http://127.0.0.1:8000/api/topics/check-topic-for-team/${teamID}`
        );
        const hasTopic = topicResponse.data;
        
        // ถ้าไม่มีหัวข้อ ให้ Redirect ทันที
        if (!hasTopic) {
          router.push('/new-topic');
        }        
      } catch (error) {
        router.push('/new-topic');
      } finally {
        setLoading(false);
      }
    }
    checkTopicExistence();
  }, [router]);

  // แสดง Loading... เฉพาะตอนที่กำลังรอข้อมูล
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingOverlay></LoadingOverlay>
      </div>
    );
  }

  // เมื่อตรวจสอบเสร็จสิ้นและไม่ถูก Redirect
  return <main>{children}</main>;
};

export default IsHaveTopicLayout;