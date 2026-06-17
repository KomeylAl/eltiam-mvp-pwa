import { toJalaali } from "jalaali-js";

export const convertDate = (date: Date): string => {
  const j = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const todayJalali = `${String(j.jd).padStart(2, "0")} - ${String(
    j.jm
  ).padStart(2, "0")} - ${j.jy}`;

  return todayJalali;
};

export function formatLocalDate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatLocalTime(date = new Date()): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
