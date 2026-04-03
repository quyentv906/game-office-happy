export type GameCategory = "office" | "offline" | "online" | "all";
export type GameTag = "HOT" | "Mới" | "Phổ biến" | "";

export interface Game {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  tag: GameTag;
  imageUrl?: string;
  link?: string;
  colorFrom: string;
  colorTo: string;
}

export const mockGames: Game[] = [
  {
    id: "caro-online",
    title: "Cờ Caro Online",
    description: "Multiplayer 1vs1, thời gian thực và tự do trò chuyện.",
    category: "online",
    tag: "HOT",
    link: "/games/caro",
    colorFrom: "from-red-400",
    colorTo: "to-orange-500"
  },
  {
    id: "chess-online",
    title: "Cờ Vua Online",
    description: "Đấu trí căng thẳng cùng hàng ngàn kỳ thủ.",
    category: "online",
    tag: "HOT",
    colorFrom: "from-blue-400",
    colorTo: "to-indigo-500"
  },
  {
    id: "typing-hero",
    title: "Gõ Phím Thần Tốc",
    description: "Luyện lướt phím đỉnh cao cho dân văn phòng.",
    category: "office",
    tag: "Phổ biến",
    colorFrom: "from-green-400",
    colorTo: "to-emerald-500"
  },
  {
    id: "draw-guess",
    title: "Vẽ & Đoán",
    description: "Game giải trí vui nhộn cùng đồng nghiệp.",
    category: "online",
    tag: "HOT",
    colorFrom: "from-pink-400",
    colorTo: "to-rose-500"
  },
  {
    id: "sudoku-master",
    title: "Sudoku Master",
    description: "Rèn luyện trí não không cần kết nối mạng.",
    category: "offline",
    tag: "Mới",
    colorFrom: "from-orange-400",
    colorTo: "to-amber-500"
  },
  {
    id: "snake-retro",
    title: "Rắn Săn Mồi Lofi",
    description: "Cổ điển 8-bit thư giãn giờ nghỉ trưa.",
    category: "office",
    tag: "",
    colorFrom: "from-teal-400",
    colorTo: "to-cyan-500"
  },
  {
    id: "multiplayer-rpg",
    title: "Huyền Thoại RPG",
    description: "Khám phá thế giới rộng lớn cùng bạn bè.",
    category: "online",
    tag: "Mới",
    colorFrom: "from-purple-400",
    colorTo: "to-fuchsia-500"
  }
];
