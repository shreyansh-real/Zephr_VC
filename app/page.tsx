import { LandingHero } from "./landing-hero";
import { NavDock } from "@/components/nav-dock";

export default function Home() {
  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--bg)" }}>
      <main>
        <LandingHero />
      </main>
      <NavDock />
    </div>
  );
}
