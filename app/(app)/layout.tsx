import { BottomNav } from "@/components/bottom-nav";
import { Sidebar } from "@/components/sidebar";

// App shell:
//   mobile: full-width column, BottomNav pinned to bottom of viewport
//   desktop (≥md): Sidebar left + scrollable content area on the right
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh flex flex-col md:flex-row bg-paper-2 md:bg-paper">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col md:bg-paper">
        <main className="flex-1 overflow-y-auto min-h-0">
          {/* On mobile, content stays in the phone-sized column.
              On desktop, expand to a comfortable reading width. */}
          <div className="mx-auto w-full max-w-[430px] md:max-w-3xl md:pb-0 pb-28">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
