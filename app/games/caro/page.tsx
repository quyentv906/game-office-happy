import RoomList from "@/features/caro/components/RoomList";

export const metadata = {
  title: "Sảnh Chơi Caro - Game Hub",
  description: "Tham gia ván cờ Caro trực tuyến cùng bạn bè.",
};

export default function CaroLobbyPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] pr-0 md:pr-4">
      <RoomList />
    </div>
  );
}
