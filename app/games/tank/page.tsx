export const metadata = {
  title: "Tank Battle - Game Hub",
  description: "Trận chiến xe tăng trực tuyến",
};

import TankLobby from "@/features/tank/components/TankLobby";

export default function TankLobbyPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] pr-0 md:pr-4">
      <TankLobby />
    </div>
  );
}
