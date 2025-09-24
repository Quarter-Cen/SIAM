'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        router.push('/');
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        const userID = decoded.sub;

        const response = await axios.get<UserData>(
          `http://127.0.0.1:8000/permission/get-teacher-profile/${userID}`
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};