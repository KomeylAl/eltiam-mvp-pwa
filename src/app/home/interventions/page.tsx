"use client";

import React, { useEffect, useRef, useState } from "react";
import { toJalaali } from "jalaali-js";
import { convertDate } from "@/utils/converts";
import InterventionForm from "@/components/InterventionForm";
import { dates } from "@/utils/constants";

const questions = [
  "از زمان آخرین پاسخدهی تا به این لحظه، آیا احساس میکردید باری بر دوش دیگرانید؟",
  "از زمان آخرین پاسخدهی تا به این لحظه، آیا احساس میکردید به هیچ چیز تعلق ندارید؟",
  "از زمان آخرین پاسخدهی تا به این لحظه، آیا می خواستید خودکشی کنید؟",
];

const Intervention = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const now = new Date();
  const date = convertDate(now);

  useEffect(() => {
    const now = new Date();
    const j = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const todayJalali = `${j.jy}-${String(j.jm).padStart(2, "0")}-${String(
      j.jd
    ).padStart(2, "0")}`;
    setSelectedDate(todayJalali);

    // اسکرول به تاریخ امروز
    setTimeout(() => {
      const el = document.getElementById(`date-${todayJalali}`);
      el?.scrollIntoView({ behavior: "smooth", inline: "center" });
    }, 300);
  }, []);

  return (
    <div className="bg-white text-black min-h-screen overflow-y-auto">
      {/* هدر سبز بالای صفحه */}
      <div className="w-full bg-[#469173] flex flex-col items-center justify-center py-12">
        <h1 className="text-3xl text-white font-bold mb-4">مداخله</h1>

        {/* نوار اسکرولی تاریخ‌ها */}
        <div
          ref={listRef}
          className="flex flex-row-reverse overflow-x-auto w-full px-4 mt-4 no-scrollbar"
        >
          {dates.map((item) => (
            <div
              key={item.date}
              id={`date-${item.date}`}
              className={`rounded-lg border mx-2 px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                item.date === selectedDate
                  ? "bg-white text-[#469173] border-white"
                  : "bg-transparent text-white border-white hover:bg-white/10"
              }`}
            >
              {item.date}
            </div>
          ))}
        </div>
      </div>

      {/* فرم روز انتخاب‌شده */}
      <div className="px-6 mt-8">
        <h2 className="font-vazir text-black text-xl text-center mb-4">
          فرم روز: {date}
        </h2>
        <InterventionForm questions={questions} />
      </div>
    </div>
  );
};

export default Intervention;
