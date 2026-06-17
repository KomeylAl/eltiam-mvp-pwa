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
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="font-vazir text-gray-500">در حال بررسی...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-fade-in">
      <div className="page-header flex flex-col items-center py-8 px-4">
        <span className="text-2xl mb-1">📊</span>
        <h1 className="text-2xl text-white font-vazir-bold">سنجش روزانه</h1>
        <p className="text-white/70 text-xs font-vazir mt-1">
          پاسخ به سوالات در بازه‌های زمانی مشخص
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
        <SurveyForm questions={questions} />
      </div>

      <Modal isOpen={showModal} onClose={() => {}} showCloseButton={false}>
        <div className="flex justify-center items-center bg-black/50 p-4 fixed inset-0 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl text-right animate-fade-in">
            <div className="text-center mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-lg font-vazir-bold mb-3 text-center">
              فرم اولیه
            </h3>
            <p className="text-sm font-vazir text-gray-600 mb-5 leading-relaxed">
              لطفاً چند دقیقه وقت بگذارید و به چند سؤال کوتاه پاسخ دهید. این
              سوالات در روند مداخله تأثیرگذار خواهند بود.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowSecondModal(true);
                  setShowModal(false);
                }}
                className="w-full py-3 btn-primary text-sm font-vazir-bold"
              >
                ثبت فرم
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 text-gray-500 font-vazir text-sm"
              >
                فعلاً بیخیال
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showSecondModal} onClose={() => setShowSecondModal(false)}>
        <div className="flex justify-center items-center bg-black/50 p-4 fixed inset-0 z-50">
          <SecureForm onSubmit={() => setShowSecondModal(false)} />
        </div>
      </Modal>
    </div>
  );
};

export default Measurement;
