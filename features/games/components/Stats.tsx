import { Users, Server, Zap, Trophy } from "lucide-react";

export default function Stats() {
  const stats = [
    { label: "Người Chơi", value: "5,000+", icon: <Users className="w-8 h-8 text-blue-500" /> },
    { label: "Trò Chơi", value: "100+", icon: <Server className="w-8 h-8 text-purple-500" /> },
    { label: "Hoạt Động", value: "24/7", icon: <Zap className="w-8 h-8 text-yellow-500" /> },
    { label: "Giải Thưởng", value: "$1M+", icon: <Trophy className="w-8 h-8 text-emerald-500" /> },
  ];

  return (
    <section className="my-16 bg-white rounded-3xl p-8 md:p-12 shadow-soft border border-slate-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-4 rounded-2xl mb-4">
              {stat.icon}
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
