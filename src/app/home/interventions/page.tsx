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

    setTimeout(() => {
      const el = document.getElementById(`date-${todayJalali}`);
      el?.scrollIntoView({ behavior: "smooth", inline: "center" });
    }, 300);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-fade-in">
      <div className="page-header flex flex-col items-center py-8 px-4">
        <span className="text-2xl mb-1">🤝</span>
        <h1 className="text-2xl text-white font-vazir-bold">مداخله</h1>
        <p className="text-white/70 text-xs font-vazir mt-1">
          پاسخ به سوالات مداخله‌ای
        </p>

        {/* <div
          ref={listRef}
          className="flex flex-row-reverse overflow-x-auto w-full px-2 mt-5 no-scrollbar"
        >
          {dates.map((item) => (
            <button
              key={item.date}
              id={`date-${item.date}`}
              onClick={() => setSelectedDate(item.date)}
              className={`rounded-full mx-1.5 px-4 py-1.5 text-xs whitespace-nowrap transition-all font-vazir ${
                item.date === selectedDate
                  ? "bg-white text-primary shadow-md scale-105"
                  : "bg-white/15 text-white border border-white/30"
              }`}
            >
              {item.date}
            </button>
          ))}
        </div> */}
      </div>

      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 mb-4">
          <p className="font-vazir text-gray-600 text-sm text-center">
            فرم روز:{" "}
            <span className="text-primary font-vazir-bold">{date}</span>
          </p>
        </div>
        <InterventionForm questions={questions} />
      </div>
    </div>
  );
};

export default Intervention;
