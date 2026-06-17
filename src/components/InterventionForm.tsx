"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import StepForm from "./StepForm";
import PositiveWordGame from "./WordGame";
import ThirdForm from "./ThirdForm";
import { insertIntervention } from "@/lib/dbActions";
import { useUser } from "@/contexts/UserContext";
import { Modal } from "@/components/Modal";

type InterventionFormProps = {
  questions: string[];
  onSubmit?: (answers: Record<number, number>) => void;
};

const options = ["اصلا", "خیلی کم", "تا حدی", "زیاد", "خیلی زیاد"];

const activationHours = [
  { start: 8, end: 11 },
  { start: 12, end: 13 },
  { start: 14, end: 15 },
  { start: 17, end: 18 },
];

const InterventionForm: React.FC<InterventionFormProps> = ({
  questions,
  onSubmit,
}) => {
  const { user } = useUser();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>(
    {}
  );
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isGameVisible, setIsGameVisible] = useState<boolean>(false);
  const [isThirdVisible, setIsThirdVisible] = useState<boolean>(false);
  const [isGameStart, setIsGameStart] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = async (questionIndex: number, optionIndex: number) => {
    if (questionIndex === 0 && (optionIndex === 3 || optionIndex === 4))
      setIsVisible(true);
    if (questionIndex === 1 && (optionIndex === 3 || optionIndex === 4))
      setIsGameVisible(true);
    if (questionIndex === 2 && (optionIndex === 3 || optionIndex === 4))
      setIsThirdVisible(true);

    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));

    try {
      await insertIntervention({
        date: new Date().toISOString().slice(0, 10),
        time: `${new Date().getHours()}:${new Date().getMinutes()}`,
        user_id: user?.id ?? 0,
        user_name: user?.name ?? "",
        q_number: questionIndex,
        a_number: optionIndex,
      });
    } catch (e) {
      console.error("error:", e);
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
      {activationHours.map((hour, groupIdx) => {
        const isActive = currentHour < hour.end && currentHour >= hour.start;
        const isExpanded = expandedBlocks[groupIdx];

        return (
          <div key={groupIdx} className="mb-6">
            <button
              onClick={() =>
                isActive
                  ? toggleExpand(groupIdx)
                  : toast("این پرسشنامه هم اکنون فعال نیست", {
                      icon: "ℹ️",
                      position: "bottom-center",
                    })
              }
              className={`w-full p-4 rounded-lg text-white text-xl font-vazir transition ${
                isActive ? "bg-[#5ba88a]" : "bg-[#b0c5be]"
              }`}
            >
              سوالات ساعت {hour.start}:00
            </button>

            {isActive && isExpanded && (
              <div className="mt-3 bg-gray-100 rounded-lg p-5">
                {questions.map((question, qIdx) => (
                  <div key={qIdx} className="mb-5">
                    <p className="text-center text-lg font-vazir">{question}</p>
                    <div className="flex flex-col mt-5 gap-3">
                      {options.map((option, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelect(qIdx, oIdx)}
                          className={`py-2 rounded-lg border border-gray-300 transition ${
                            answers[qIdx] === oIdx
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-800"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Modal 1 */}
      <Modal
        isOpen={isVisible}
        onClose={() => setIsVisible(false)}
        showCloseButton={false}
      >
        <div className="flex justify-center items-center bg-black/50 p-4 fixed inset-0 z-50">
          <StepForm onSubmit={() => setIsVisible(false)} />
        </div>
      </Modal>

      {/* Modal 2 */}
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

      {/* Modal 3 */}
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
