import { MobileFrame } from "@/components/mobile-frame";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MobileFrame>{children}</MobileFrame>;
}
