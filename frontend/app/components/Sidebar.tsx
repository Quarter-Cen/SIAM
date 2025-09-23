'use client'

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { House, ListBullets, Hash, Users, DoorOpenIcon } from '@phosphor-icons/react';
import { useAuth } from '@/app/context/AuthContext'; // อิมพอร์ต useAuth จาก AuthContext ที่เราสร้างไว้

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active }) => {
    const activeClasses = active ? 'bg-[#f0f2f5] rounded-lg' : '';
    return (
        <div className={`flex items-center gap-3 px-3 py-2 ${activeClasses}`}>
            <div className="text-[#111418]">{icon}</div>
            <p className="text-[#111418] text-sm font-medium leading-normal">{label}</p>
        </div>
    );
};

interface SidebarLinkProps {
    href: string;
    label: string;
    icon: React.ReactNode;
    pathname: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, label, icon, pathname }) => {
    const isActive = pathname === href;
    return (
        <Link href={href} passHref>
            <SidebarItem icon={icon} label={label} active={isActive} />
        </Link>
    );
};

export default function Sidebar() {
    const { user, loading, logout } = useAuth(); // ดึงข้อมูล user, loading และ logout จาก Context โดยตรง
    const pathname = usePathname();

    if (loading) {
        return (
            <div className="layout-content-container flex flex-col w-80">
                <div className="flex h-full min-h-[700px] flex-col justify-between bg-white p-4">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-[#111418] text-[20px] font-medium leading-normal">Loading...</h1>
                        <div className="flex flex-col gap-2">
                            <SidebarLink href="/my-teams" label="กลุ่มของฉัน" icon={<ListBullets size={24} />} pathname={pathname} />
                            <SidebarLink href="/Topics" label="หัวข้อทั้งหมด" icon={<Hash size={24} />} pathname={pathname} />
                            <button onClick={logout} className="flex items-center gap-3 px-3 py-2 cursor-pointer text-black">
                            <DoorOpenIcon size={24} />
                            <p className="text-[#111418] text-sm font-medium leading-normal">ออกจากระบบ</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // ไม่แสดง Sidebar ถ้าไม่มีข้อมูลผู้ใช้ (เช่น ยังไม่ได้ล็อกอิน)
    }

    return (
        <div className="layout-content-container flex flex-col w-80">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-white p-4">
                <div className="flex flex-col gap-4">
                    <h1 className="text-[#111418] text-[20px] font-medium leading-normal">{user.name}</h1>
                    <div className="flex flex-col gap-2">
                        <SidebarLink href="/my-teams" label="กลุ่มของฉัน" icon={<ListBullets size={24} />} pathname={pathname} />
                        <SidebarLink href="/Topics" label="หัวข้อทั้งหมด" icon={<Hash size={24} />} pathname={pathname} />
                        <button onClick={logout} className="flex items-center gap-3 px-3 py-2 cursor-pointer text-black">
                           <DoorOpenIcon size={24} />
                           <p className="text-[#111418] text-sm font-medium leading-normal">ออกจากระบบ</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}