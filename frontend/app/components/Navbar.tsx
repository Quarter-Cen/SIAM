"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ProfileDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Client-side logout logic
    console.log("User logged out!");
    setIsDropdownOpen(false);
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f1f2f4] px-10 py-3">
      <div className="flex items-center gap-4 text-[#121416]">
        <h2 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em]">
          SIAM
        </h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
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
}
