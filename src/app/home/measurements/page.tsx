"use client";

import React, { useEffect, useRef, useState } from "react";
import { isFirstTimeUser } from "@/contexts/FormContext";
import { convertDate } from "@/utils/converts";
import { toJalaali } from "jalaali-js";
import { dates, questions } from "@/utils/constants";
import SurveyForm from "@/components/SurveyForm";
import SecureForm from "@/components/SecureForm";
import { Modal } from "@/components/Modal";

const Measurement = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [checking, setChecking] = useState(true);
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

  useEffect(() => {
    const checkFormStatus = async () => {
      const isDone = isFirstTimeUser();
      setShowModal(isDone);
      setChecking(false);
    };
    checkFormStatus();
  }, []);

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-white text-black">
        <p className="font-vazir text-lg">در حال بررسی...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Header section */}
      <div className="w-full bg-[#469173] flex flex-col items-center justify-center py-12">
        <h1 className="text-3xl text-white font-bold mb-4">سنجش</h1>

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

      {/* Body section */}
      <div className="px-4 mt-6 text-center">
        <h2 className="font-vazir text-black text-xl mb-6">فرم روز: {date}</h2>
        <SurveyForm questions={questions} />
      </div>

      {/* Modal for first-time form */}
      <Modal isOpen={showModal} onClose={() => {}} showCloseButton={false}>
        <div className="flex justify-center items-center bg-black/50 p-4 fixed inset-0 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl text-right">
            <h3 className="text-lg font-vazir-bold mb-4">فرم اولیه</h3>
            <p className="text-base font-vazir mb-4">
              لطفاً چند دقیقه از وقت‌تون رو بگذارید و به چند سؤال کوتاه پاسخ
              بدین. این سوالات در روند مداخله تأثیرگذار خواهند بود.
            </p>

            <div className="mt-4 flex flex-row-reverse justify-between gap-3">
              <button
                onClick={() => {
                  setShowSecondModal(true);
                  setShowModal(false);
                }}
                className="px-6 py-2 bg-[#5ba88a] rounded-md text-white font-vazir"
              >
                ثبت فرم
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-blue-500 rounded-md text-white font-vazir"
              >
                فعلاً بیخیال
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal for secure form */}
      <Modal isOpen={showSecondModal} onClose={() => setShowSecondModal(false)}>
        <div className="flex justify-center items-center bg-black/50 p-4 fixed inset-0 z-50">
          <SecureForm onSubmit={() => setShowSecondModal(false)} />
        </div>
      </Modal>
    </div>
  );
};

export default Measurement;
