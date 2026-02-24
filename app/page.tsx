import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Playground } from "@/components/playground";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F5F0E5]">
      <Navbar />
      <Hero />
      <Playground />
    </main>
  );
}
