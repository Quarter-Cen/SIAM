
'use client'

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import LoadingOverlay from './LoadingOverlay';

interface DecodedToken {
  sub: string;
  role: 'student' | 'teacher';
  exp: number;
}

interface AuthLayoutProps {
  children: ReactNode;
  allowedRoles: ('student' | 'teacher')[];
}

export default function AuthLayout({ children, allowedRoles }: AuthLayoutProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const userRole = decoded.role;
      const isTokenExpired = decoded.exp * 1000 < Date.now();
      
      if (!isTokenExpired && allowedRoles.includes(userRole)) {
        setIsAuthenticated(true);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error("Error decoding JWT:", error);
      router.push('/');
    }
  }, [router, allowedRoles]);

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingOverlay></LoadingOverlay>
      </div>
    );
  }

  return (
    <>
      {/* เพิ่ม Navbar, Sidebar หรือส่วนอื่น ๆ ที่ต้องการ */}
      <main>
        {children}
      </main>
    </>
  );
}