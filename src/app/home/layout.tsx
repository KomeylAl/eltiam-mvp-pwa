import "../globals.css";
import BottomNav from "@/components/BottomNav";

export default function ApplicationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
      <BottomNav />
    </div>
  );
}
