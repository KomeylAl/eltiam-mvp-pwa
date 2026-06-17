"use client";

import { useAutoSync } from "@/hooks/useAutoSync";
import { useFormReminders } from "@/hooks/useFormReminders";

export default function FormRemindersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useFormReminders();
  useAutoSync();
  return <>{children}</>;
}
