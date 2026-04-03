import Link from "next/link";
import { ArrowLeft, Gamepad } from "lucide-react";
import { socketService } from "@/lib/socket";

export default function GamePage({ params }: { params: { id: string } }) {
  // In a real app we would initialize socket connections here or in a lower-level GameClient component
  // useEffect(() => {
  //   socketService.connect();
  //   return () => socketService.disconnect();
  // }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
      
      {/* Game Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-900 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-white font-bold inline-flex items-center gap-2">
              <Gamepad className="w-5 h-5 text-purple-500" />
              Đang chơi: {params.id}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-400">Server Online (Singapore)</span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          Ping: 24ms
        </div>
      </div>

      {/* Game Client Area (Placeholder) */}
      <div className="flex-1 relative bg-slate-900 flex items-center justify-center">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 text-center max-w-md p-8 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl">
          <div className="w-16 h-16 bg-purple-500/20 text-purple-400 flex items-center justify-center rounded-2xl mx-auto mb-4 border border-purple-500/30">
            <Gamepad className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Không Gian Game</h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Khu vực đồ họa game (Canvas / WebGL / Socket) sẽ được hiển thị tại đây. 
            <br/><br/>
            Game ID: <span className="text-purple-400 font-mono bg-purple-400/10 px-2 py-1 rounded">{params.id}</span> hiện đang trong giai đoạn phát triển.
          </p>
        </div>
      </div>

    </div>
  );
}
