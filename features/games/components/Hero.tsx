import Link from "next/link";
import { PlayCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-2xl">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-fuchsia-400 rounded-full mix-blend-overlay filter blur-3xl" />
      </div>

      <div className="relative z-10 px-8 py-20 md:py-28 lg:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-md">
          Chơi Game Trực Tuyến <br className="hidden md:block" /> Cùng Bạn Bè
        </h1>
        <Link
          href="#games"
          className="group inline-flex items-center gap-3 bg-white text-purple-700 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <PlayCircle className="w-6 h-6 group-hover:animate-pulse" />
          Bắt Đầu Chơi
        </Link>
      </div>
    </section>
  );
}
