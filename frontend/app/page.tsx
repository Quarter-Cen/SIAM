// app/login/page.tsx
import React from 'react';
import LoginForm from './components/LoginForm'; // Client Component
import Image from 'next/image';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      {/* Background with a subtle gradient and rounded corners */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl m-4 sm:m-6 lg:m-8 opacity-75 blur-2xl"></div>

      {/* Main content container */}
      <div className="relative z-10 bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full flex flex-col lg:flex-row p-6 lg:p-0">
        
        {/* Left Section: Project Description */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center text-center lg:text-left text-gray-800">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 tracking-[-0.03em] text-[#121416]">
            ระบบผู้ช่วยงานโครงงาน <br className="hidden lg:inline" />เชิงบริบท SIAM
          </h1>
          <p className="text-sm sm:text-base lg:text-lg font-normal mb-8 max-w-lg mx-auto lg:mx-0">
            SIAM คือเครื่องมือที่ช่วยให้นักศึกษาสามารถวางแผนและรับคำแนะนำเชิงลึกสำหรับโครงงานคอมพิวเตอร์ โดยใช้ข้อมูลจากโครงงานรุ่นพี่เพื่อสร้างข้อเสนอแนะที่เหมาะสม
          </p>
          <div className="flex justify-center lg:justify-start gap-4 text-sm font-medium">
            <p>
              โปรดเข้าสู่ระบบเพื่อเริ่มต้นการใช้งาน
            </p>
          </div>
        </div>

        {/* Right Section: Login Form */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 flex items-center justify-center bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200">
          <div className="max-w-md w-full space-y-8">
            <h2 className="text-2xl font-bold text-center text-[#121416]">
              เข้าสู่ระบบ
            </h2>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;