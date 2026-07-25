import "../globals.css";
import BottomNav from "@/components/BottomNav";
import FormRemindersProvider from "@/components/FormRemindersProvider";
import PushNotificationProvider from "@/components/PushNotificationProvider";

export default function ApplicationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FormRemindersProvider>
      <PushNotificationProvider>
        <div>
          {children}
          <BottomNav />
        </div>
      </PushNotificationProvider>
    </FormRemindersProvider>
  );
}
