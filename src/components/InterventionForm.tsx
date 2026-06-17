"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import StepForm from "./StepForm";
import PositiveWordGame from "./WordGame";
import ThirdForm from "./ThirdForm";
import { formatLocalDate, formatLocalTime } from "@/utils/converts";
import {
  insertInterventionsBatch,
  isInterventionSlotSubmitted,
  syncWithServer,
} from "@/lib/dbActions";
import { onFormAnswerSubmitted } from "@/lib/notifications";
import { useUser } from "@/contexts/UserContext";
import { INTERVENTION_SLOTS } from "@/utils/schedule";
import { Modal } from "@/components/Modal";

type InterventionFormProps = {
  questions: string[];
};

const options = ["اصلا", "خیلی کم", "تا حدی", "زیاد", "خیلی زیاد"];

const InterventionForm: React.FC<InterventionFormProps> = ({ questions }) => {
  const { user } = useUser();
  const [slotAnswers, setSlotAnswers] = useState<
    Record<number, Record<number, number>>
  >({});
  const [submittedSlots, setSubmittedSlots] = useState<Record<number, boolean>>(
    {}
  );
  const [submittingSlot, setSubmittingSlot] = useState<number | null>(null);
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>(
    {}
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isGameVisible, setIsGameVisible] = useState(false);
  const [isThirdVisible, setIsThirdVisible] = useState(false);
  const [isGameStart, setIsGameStart] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadSubmitted = async () => {
      const date = formatLocalDate();
      const statuses: Record<number, boolean> = {};
      for (let i = 0; i < INTERVENTION_SLOTS.length; i++) {
        statuses[i] = await isInterventionSlotSubmitted(
          INTERVENTION_SLOTS[i],
          date
        );
      }
      setSubmittedSlots(statuses);
    };
    loadSubmitted();
  }, [currentHour]);

  const handleSelect = (
    slotIdx: number,
    questionIndex: number,
    optionIndex: number
  ) => {
    if (submittedSlots[slotIdx]) return;
    setSlotAnswers((prev) => ({
      ...prev,
      [slotIdx]: { ...prev[slotIdx], [questionIndex]: optionIndex },
    }));
  };

  const handleSubmit = async (slotIdx: number) => {
    const answers = slotAnswers[slotIdx] ?? {};
    const allAnswered = questions.every((_, i) => answers[i] !== undefined);

    if (!allAnswered) {
      toast.error("لطفاً به هر ۳ سؤال پاسخ دهید.");
      return;
    }

    if (submittedSlots[slotIdx]) {
      toast("این پرسشنامه قبلاً ثبت شده است.", { icon: "✓" });
      return;
    }

    setSubmittingSlot(slotIdx);
    const now = new Date();
    const date = formatLocalDate(now);
    const time = formatLocalTime(now);

    const records = questions.map((_, qIdx) => ({
      date,
      time,
      user_id: user?.id ?? 0,
      user_name: user?.name ?? "",
      q_number: qIdx,
      a_number: answers[qIdx],
    }));

    try {
      await insertInterventionsBatch(records);
      setSubmittedSlots((prev) => ({ ...prev, [slotIdx]: true }));

      const result = await syncWithServer({ silent: true });
      await onFormAnswerSubmitted("intervention");

      if (answers[0] >= 3) setIsVisible(true);
      if (answers[1] >= 3) setIsGameVisible(true);
      if (answers[2] >= 3) setIsThirdVisible(true);

      if (result.skippedOffline) {
        toast.success("پاسخ‌ها ذخیره شد. با اتصال اینترنت ارسال می‌شود.");
      } else {
        toast.success("پرسشنامه با موفقیت ثبت و ارسال شد.");
      }
    } catch (e) {
      console.error("error:", e);
      toast.error("خطا در ثبت. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmittingSlot(null);
    }
  };

  const toggleExpand = (blockIndex: number) => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [blockIndex]: !prev[blockIndex],
    }));
  };

  return (
    <div className="p-4 pb-24 relative">
      {INTERVENTION_SLOTS.map((hour, groupIdx) => {
        const isActive = currentHour < hour.end && currentHour >= hour.start;
        const isExpanded = expandedBlocks[groupIdx];
        const answers = slotAnswers[groupIdx] ?? {};
        const isSubmitted = submittedSlots[groupIdx];
        const isSubmitting = submittingSlot === groupIdx;
        const allAnswered = questions.every((_, i) => answers[i] !== undefined);

        return (
          <div
            key={groupIdx}
            className="mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-100"
          >
            <button
              onClick={() =>
                isActive
                  ? toggleExpand(groupIdx)
                  : toast("این پرسشنامه هم اکنون فعال نیست", {
                      icon: "ℹ️",
                      position: "bottom-center",
                    })
              }
              className={`w-full p-4 text-white text-base font-vazir-bold transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-gradient-to-l from-primary-light to-primary"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <span>{isSubmitted ? "✓" : "⏰"}</span>
              سوالات ساعت {hour.start}:00
              {isSubmitted && (
                <span className="text-xs opacity-80">(ثبت شده)</span>
              )}
            </button>

            {isActive && isExpanded && (
              <div className="bg-white p-5">
                {questions.map((question, qIdx) => (
                  <div key={qIdx} className="mb-5">
                    <p className="text-center text-base font-vazir text-gray-700 leading-relaxed">
                      {question}
                    </p>
                    <div className="flex flex-col mt-3 gap-2">
                      {options.map((option, oIdx) => (
                        <button
                          key={oIdx}
                          disabled={isSubmitted}
                          onClick={() => handleSelect(groupIdx, qIdx, oIdx)}
                          className={`py-2.5 rounded-xl border transition-all font-vazir text-sm ${
                            answers[qIdx] === oIdx
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:border-primary/40"
                          } ${isSubmitted ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => handleSubmit(groupIdx)}
                  disabled={isSubmitted || isSubmitting || !allAnswered}
                  className={`w-full py-3.5 rounded-xl font-vazir-bold text-base transition-all ${
                    isSubmitted
                      ? "bg-primary-soft text-primary cursor-default"
                      : allAnswered
                        ? "btn-primary"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitted
                    ? "✓ ثبت شده"
                    : isSubmitting
                      ? "در حال ثبت و ارسال..."
                      : "ثبت پاسخ‌ها"}
                </button>
              </div>
            )}
          </div>
        );
      })}

      <Modal
        isOpen={isVisible}
        onClose={() => setIsVisible(false)}
        showCloseButton={false}
      >
        <div className="flex justify-center items-center bg-black/50 p-4 fixed inset-0 z-50">
          <StepForm onSubmit={() => setIsVisible(false)} />
        </div>
      </Modal>

      <Modal
        isOpen={isGameVisible}
        onClose={() => setIsGameVisible(false)}
        showCloseButton={false}
      >
        <div className="flex justify-center items-center bg-black/50 p-4 fixed inset-0 z-50">
          <div className={`p-8 bg-white rounded-lg ${isGameStart && "h-4/5"}`}>
            {!isGameStart ? (
              <div>
                <p className="text-center font-vazir text-xl">
                  قراره یه بازی کلمات ساده انجام بدیم. حاضری؟
                </p>
                <div className="flex flex-row-reverse gap-4 justify-center mt-6">
                  <button
                    onClick={() => setIsGameStart(true)}
                    className="w-1/3 bg-[#5ba88a] p-2 rounded-lg text-white font-vazir-bold"
                  >
                    بله
                  </button>
                  <button
                    onClick={() => setIsGameVisible(false)}
                    className="w-1/3 bg-rose-500 p-2 rounded-lg text-white font-vazir-bold"
                  >
                    خیر
                  </button>
                </div>
              </div>
            ) : (
              <PositiveWordGame
                onFinish={() => {
                  setIsGameVisible(false);
                  setIsGameStart(false);
                }}
              />
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isThirdVisible}
        onClose={() => setIsThirdVisible(false)}
        showCloseButton={false}
      >
        <div className="flex justify-center items-center bg-black/50 p-4 fixed inset-0 z-50">
          <ThirdForm
            onSuccess={() => {
              toast.success("اطلاعات با موفقیت ثبت شد.");
              setIsThirdVisible(false);
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default InterventionForm;
