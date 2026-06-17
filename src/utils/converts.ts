import { toJalaali } from "jalaali-js";

export const convertDate = (date: Date): string => {
  const j = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const todayJalali = `${String(j.jd).padStart(2, "0")} - ${String(
    j.jm
  ).padStart(2, "0")} - ${j.jy}`;

  return todayJalali;
};
