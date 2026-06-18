import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatLocalDate, formatLocalTime } from "@/utils/converts";
import { insertMeasurementsBatch, syncWithServer } from "@/lib/dbActions";
import { onFormAnswerSubmitted } from "@/lib/notifications";
import { useUser } from "@/contexts/UserContext";
import { MEASUREMENT_SLOTS } from "@/utils/schedule";
import CallModal from "./CallModal";

type SurveyFormProps = {
  questions: string[];
};

const options = ["اصلا", "خیلی کم", "تا حدی", "زیاد", "خیلی زیاد"];

const SurveyForm: React.FC<SurveyFormProps> = ({ questions }) => {
  const { user } = useUser();
  const [slotAnswers, setSlotAnswers] = useState<
    Record<number, Record<number, number>>
  >({});
  const [submittingSlot, setSubmittingSlot] = useState<number | null>(null);
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>(
    {}
  );
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentHour(new Date().getHours()),
      60000
    );
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (
    slotIdx: number,
    questionIndex: number,
    optionIndex: number
  ) => {
    if (optionIndex >= 3) {
      setShowCallModal(true);
    }

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
      await insertMeasurementsBatch(records);

      const result = await syncWithServer({ silent: true });
      await onFormAnswerSubmitted("measurement");

      setSlotAnswers((prev) => ({ ...prev, [slotIdx]: {} }));

      if (result.skippedOffline) {
        toast.success("پاسخ‌ها ذخیره شد. با اتصال اینترنت ارسال می‌شود.");
      } else {
        toast.success("پرسشنامه با موفقیت ثبت و ارسال شد.");
      }
    } catch (e) {
      console.error("Error submitting measurement:", e);
      toast.error("خطا در ثبت. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmittingSlot(null);
    }
  };

  const toggleExpand = (blockIndex: number) => {
    setExpandedBlocks((prev) => ({ ...prev, [blockIndex]: !prev[blockIndex] }));
  };

  return (
    <div className="p-4 space-y-6">
      {MEASUREMENT_SLOTS.map((hour, idx) => {
        const isActive = currentHour >= hour.start && currentHour < hour.end;
        const isExpanded = expandedBlocks[idx];
        const answers = slotAnswers[idx] ?? {};
        const isSubmitting = submittingSlot === idx;
        const allAnswered = questions.every((_, i) => answers[i] !== undefined);

        return (
          <div
            key={idx}
            className="rounded-xl overflow-hidden shadow-sm border border-gray-100"
          >
            <button
              onClick={() =>
                isActive
                  ? toggleExpand(idx)
                  : toast("این پرسشنامه هم اکنون فعال نیست", {
                      icon: "⏰",
                      position: "bottom-center",
                    })
              }
              className={`w-full py-4 text-white font-vazir-bold text-base transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-gradient-to-l from-primary-light to-primary"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <span>⏰</span>
              سوالات ساعت {hour.start}:00
            </button>

            {isActive && isExpanded && (
              <div className="bg-white p-5 space-y-6">
                {questions.map((question, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <p className="text-base font-vazir text-center text-gray-700 leading-relaxed">
                      {question}
                    </p>
                    <div className="flex flex-col mt-3 gap-2">
                      {options.map((option, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelect(idx, qIdx, oIdx)}
                          className={`py-2.5 rounded-xl border transition-all font-vazir text-sm ${
                            answers[qIdx] === oIdx
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:border-primary/40"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => handleSubmit(idx)}
                  disabled={isSubmitting || !allAnswered}
                  className={`w-full py-3.5 rounded-xl font-vazir-bold text-base transition-all ${
                    allAnswered && !isSubmitting
                      ? "btn-primary"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "در حال ثبت و ارسال..." : "ثبت پاسخ‌ها"}
                </button>
              </div>
            )}
          </div>
        );
      })}

      <CallModal
        isVisible={showCallModal}
        onClose={() => setShowCallModal(false)}
      />
    </div>
  );
};

export default SurveyForm;
