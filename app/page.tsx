import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Playground } from "@/components/playground";
import { Privacy } from "@/components/privacy";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F5F0E5]">
      <Navbar />
      <Hero />
      <Playground />
      <Privacy />
      <Footer />
    </main>
  );
}
