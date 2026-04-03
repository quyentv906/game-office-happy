import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Game Hub - Chơi Game Trực Tuyến",
  description: "Cổng game giải trí trực tuyến tuyệt vời nhất dành cho bạn bè.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <div className="flex min-h-screen flex-col overflow-x-hidden">
          <Header />
          <div className="flex flex-1 w-full max-w-screen-2xl mx-auto">
            {/* Left Ad Sidebar (Empty for future ads) */}
            <aside className="hidden lg:block w-20 p-4"></aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full py-8 px-4 md:px-8 min-w-0">
              {children}
            </main>

            {/* Right Ad Sidebar (Empty for future ads) */}
            <aside className="hidden lg:block w-20 p-4"></aside>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
