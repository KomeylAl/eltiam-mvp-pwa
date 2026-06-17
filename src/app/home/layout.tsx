import "../globals.css";
import BottomNav from "@/components/BottomNav";
import FormRemindersProvider from "@/components/FormRemindersProvider";

export default function ApplicationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FormRemindersProvider>
      <div>
        {children}
        <BottomNav />
      </div>
    </FormRemindersProvider>
  );
}
