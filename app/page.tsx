import Hero from "@/features/games/components/Hero";
import GameTabs from "@/features/games/components/GameTabs";
import GameGrid from "@/features/games/components/GameGrid";
import Stats from "@/features/games/components/Stats";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <Hero />
      
      <section id="games" className="scroll-mt-20">
        <GameTabs />
        <GameGrid />
      </section>

      <Stats />
    </div>
  );
}
