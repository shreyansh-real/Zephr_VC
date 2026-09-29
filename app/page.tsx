import { Header } from "@/components/header";
import { LandingHero } from "./landing-hero";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Header />
      <main>
        <LandingHero />
      </main>
    </div>
  );
}
