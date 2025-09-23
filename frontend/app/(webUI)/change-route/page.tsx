// File: app/ChangeRoute/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  role: 'student' | 'teacher';
  exp: number;
}

export default function ChangeRoute() {
  const router = useRouter();

  useEffect(() => {
    // 1. ดึง Token จาก Local Storage
    const token = localStorage.getItem('access_token');

    // 2. ถ้าไม่มี Token หรือ Token หมดอายุ ให้กลับไปหน้า Login
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // 3. ถอดรหัส Token เพื่อดึงข้อมูล payload
      const decoded: DecodedToken = jwtDecode(token);
      
      const userRole = decoded.role;
      
      // 4. ตรวจสอบบทบาทของผู้ใช้ (role)
      if (userRole === 'student') {
        // หากเป็น student, นำทางไปหน้า student
        router.push('/dashboard');
      } else if (userRole === 'teacher') {
        // หากเป็น teacher, นำทางไปหน้า teacher
        router.push('/Topics');
      } else {
        // หากบทบาทไม่ถูกต้อง ให้กลับไปหน้า Login
        router.push('/login');
      }

    } catch (error) {
      console.error("Error decoding JWT:", error);
      // หากเกิดข้อผิดพลาดในการถอดรหัส Token, กลับไปหน้า Login
      router.push('/login');
    }
    
  }, [router]); // ระบุ router เป็น dependency เพื่อให้ useEffect ทำงานถูกต้อง

  return (
    <div className="flex flex-wrap justify-between gap-3 p-4">
      <p className="text-[#111418] tracking-tight text-[32px] font-bold leading-tight min-w-72">
        Please wait, checking your permissions...
      </p>
    </div>
  );
}