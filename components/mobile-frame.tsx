import type { ReactNode } from "react";

// Public-page wrapper:
//   mobile: phone-shaped (max-w-430px) paper card on a paper-2 background
//   desktop: full-width paper canvas (no phone framing)
//
// Inner pages decide their own desktop layout (e.g. landing 2-col hero,
// auth centered card).
export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="bg-paper-2 md:bg-paper min-h-dvh">
      <div className="mx-auto w-full max-w-[430px] md:max-w-none min-h-dvh bg-paper md:bg-transparent flex flex-col">
        {children}
      </div>
    </div>
  );
}
