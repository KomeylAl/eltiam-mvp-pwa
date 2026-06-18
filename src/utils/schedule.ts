import { formatLocalDate } from "./converts";

export type ActivationSlot = {
  start: number;
  end: number;
  label: string;
};

export type FormType = "measurement" | "intervention";

export const MEASUREMENT_SLOTS: ActivationSlot[] = [
  { start: 8, end: 11, label: "۸:۰۰ تا ۱۱:۰۰" },
  { start: 12, end: 13, label: "۱۲:۰۰ تا ۱۳:۰۰" },
  { start: 14, end: 15, label: "۱۴:۰۰ تا ۱۵:۰۰" },
  { start: 16, end: 24, label: "۱۶:۰۰ تا ۱۸:۰۰" },
  { start: 16, end: 24, label: "۱۶:۰۰ تا ۱۸:۰۰" },
];

export const INTERVENTION_SLOTS: ActivationSlot[] = [
  { start: 8, end: 11, label: "۸:۰۰ تا ۱۱:۰۰" },
  { start: 12, end: 13, label: "۱۲:۰۰ تا ۱۳:۰۰" },
  { start: 14, end: 15, label: "۱۴:۰۰ تا ۱۵:۰۰" },
  { start: 17, end: 24, label: "۱۷:۰۰ تا ۱۸:۰۰" },
  { start: 17, end: 24, label: "۱۷:۰۰ تا ۱۸:۰۰" },
];

export const FORM_REMINDERS_ENABLED_KEY = "form_reminders_enabled";
export const NOTIFIED_PREFIX = "notified_";

export function todayDateString(date = new Date()): string {
  return formatLocalDate(date);
}

export function slotKey(
  formType: FormType,
  slotStart: number,
  date = todayDateString()
): string {
  return `${date}_${formType}_${slotStart}`;
}

export function getActiveSlot(
  slots: ActivationSlot[],
  now = new Date()
): ActivationSlot | null {
  const hour = now.getHours();
  return slots.find((s) => hour >= s.start && hour < s.end) ?? null;
}

export function parseRecordHour(time: string): number {
  const [h] = time.split(":");
  return parseInt(h, 10);
}

export function isRecordInSlot(
  time: string,
  slot: ActivationSlot
): boolean {
  const hour = parseRecordHour(time);
  return hour >= slot.start && hour < slot.end;
}

export function getUpcomingReminders(
  now = new Date()
): {
  id: string;
  formType: FormType;
  slotStart: number;
  timestamp: number;
  title: string;
  body: string;
  url: string;
}[] {
  const date = todayDateString(now);
  const reminders: ReturnType<typeof getUpcomingReminders> = [];
  const configs: { formType: FormType; slots: ActivationSlot[]; url: string }[] =
    [
      {
        formType: "measurement",
        slots: MEASUREMENT_SLOTS,
        url: "/home/measurements",
      },
      {
        formType: "intervention",
        slots: INTERVENTION_SLOTS,
        url: "/home/interventions",
      },
    ];

  for (const { formType, slots, url } of configs) {
    for (const slot of slots) {
      const reminderTime = new Date(now);
      reminderTime.setHours(slot.start, 0, 0, 0);

      if (reminderTime.getTime() <= now.getTime()) continue;

      reminders.push({
        id: slotKey(formType, slot.start, date),
        formType,
        slotStart: slot.start,
        timestamp: reminderTime.getTime(),
        title: formType === "measurement" ? "⏰ وقت سنجش روزانه" : "⏰ وقت فرم مداخله",
        body:
          formType === "measurement"
            ? `بازه ${slot.label} — لطفاً فرم سنجش را تکمیل کنید.`
            : `بازه ${slot.label} — لطفاً فرم مداخله را تکمیل کنید.`,
        url,
      });
    }
  }

  return reminders.sort((a, b) => a.timestamp - b.timestamp);
}
