import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { insertMeasurement } from "@/lib/dbActions";
import { useUser } from "@/contexts/UserContext";
import { Modal } from "./Modal";
import CallModal from "./CallModal";
import { useModal } from "@/hooks/useModal";

type SurveyFormProps = {
  questions: string[];
  onSubmit?: (answers: Record<number, number>) => void;
};

const options = ["اصلا", "خیلی کم", "تا حدی", "زیاد", "خیلی زیاد"];

const activationHours = [
  { start: 8, end: 11 },
  { start: 12, end: 13 },
  { start: 14, end: 15 },
  { start: 16, end: 18 },
];

const SurveyForm: React.FC<SurveyFormProps> = ({ questions, onSubmit }) => {
  const { user } = useUser();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>(
    {}
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentHour(new Date().getHours()),
      60000
    );
    return () => clearInterval(interval);
  }, []);

  const handleSelect = async (questionIndex: number, optionIndex: number) => {
    if (optionIndex >= 3) setIsVisible(true);
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));

    try {
      await insertMeasurement({
        date: new Date().toISOString().slice(0, 10),
        time: `${new Date().getHours()}:${new Date().getMinutes()}`,
        user_id: user?.id ?? 0,
        user_name: user?.name ?? "",
        q_number: questionIndex,
        a_number: optionIndex,
      });
    } catch (e) {
      console.error("Error inserting measurement:", e);
    }
  };

  const toggleExpand = (blockIndex: number) => {
    setExpandedBlocks((prev) => ({ ...prev, [blockIndex]: !prev[blockIndex] }));
  };

  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="p-4 space-y-6">
      {activationHours.map((hour, idx) => {
        const isActive = currentHour >= hour.start && currentHour < hour.end;
        const isExpanded = expandedBlocks[idx];

        return (
          <div key={idx} className="rounded-lg overflow-hidden shadow">
            {/* هدر آکاردئون */}
            <button
              onClick={() =>
                isActive
                  ? toggleExpand(idx)
                  : toast("این پرسشنامه هم اکنون فعال نیست", {
                      icon: "⏰",
                      position: "bottom-center",
                    })
              }
              className={`w-full py-4 text-white font-vazir text-lg transition-colors ${
                isActive
                  ? "bg-[#5ba88a] hover:bg-[#4a9b7c]"
                  : "bg-[#b0c5be] cursor-not-allowed"
              }`}
            >
              سوالات ساعت {hour.start}:00
            </button>

            {/* محتوای آکاردئون */}
            {isActive && isExpanded && (
              <div className="bg-gray-100 p-5 space-y-6">
                {questions.map((question, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <p className="text-lg font-vazir text-center">{question}</p>
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

      {/* مودال تماس */}
      <CallModal isVisible={isVisible} onClose={() => setIsVisible(false)} />
    </div>
  );
};

export default SurveyForm;
