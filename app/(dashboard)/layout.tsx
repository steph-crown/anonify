import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F5F0E5]">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-white ">
        <div className="max-w-[900px] mx-auto px-4">{children}</div>
      </main>
    </div>
  );
}
