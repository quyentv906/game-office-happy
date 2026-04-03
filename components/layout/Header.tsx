"use client";

import Link from "next/link";
import { Gamepad2, Menu } from "lucide-react";
import { useCaroStore } from "@/features/caro/store/useCaroStore";

export default function Header() {
  const { isPlaying } = useCaroStore();

  const handleNavClick = (e: React.MouseEvent) => {
    if (isPlaying) {
      if (!window.confirm("Bạn có chắc chắn muốn rời phòng? Trận đấu sẽ kết thúc nếu bạn thoát.")) {
        e.preventDefault();
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-8 w-full max-w-screen-2xl mx-auto">
        <Link href="/" onClick={handleNavClick} className="flex items-center gap-2 font-bold text-xl text-purple-700">
          <Gamepad2 className="w-8 h-8" />
          <span>GAME HUB</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex ml-10 space-x-8 text-sm font-medium text-slate-700">
          <Link href="/" onClick={handleNavClick} className="hover:text-purple-600 transition-colors">
            Trang Chủ
          </Link>
          <Link href="/#games" onClick={handleNavClick} className="hover:text-purple-600 transition-colors">
            Trò Chơi
          </Link>
          <Link href="/#leaderboard" onClick={handleNavClick} className="hover:text-purple-600 transition-colors">
            Bảng Xếp Hạng
          </Link>
          <Link href="/#account" onClick={handleNavClick} className="hover:text-purple-600 transition-colors">
            Tài Khoản
          </Link>
        </nav>

        {/* Mobile Menu Icon */}
        <div className="ml-auto md:hidden">
          <button className="p-2 text-slate-700">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex ml-auto items-center gap-4">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            Đăng Nhập
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg shadow-md hover:opacity-90 transition-opacity">
            Đăng Ký
          </button>
        </div>
      </div>
    </header>
  );
}
