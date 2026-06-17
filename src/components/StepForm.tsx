"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { insertSocialProblem } from "@/lib/dbActions";
import { useUser } from "@/contexts/UserContext";

interface StepFormProps {
  onSubmit: () => void;
}

interface Solution {
  text: string;
}

interface Evaluation {
  strengths?: string;
  weaknesses?: string;
}

const StepForm: React.FC<StepFormProps> = ({ onSubmit }) => {
  const { user } = useUser();
  const [step, setStep] = useState<number>(1);

  const [problem, setProblem] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const [solutions, setSolutions] = useState<Solution[]>([
    { text: "" },
    { text: "" },
    { text: "" },
  ]);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [bestIndex, setBestIndex] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>("");

  const handleAddSolution = () => {
    setSolutions((prev) => [...prev, { text: "" }]);
  };

  const canGoNext = (): boolean => {
    switch (step) {
      case 1:
        return problem.trim() !== "" && reason.trim() !== "";
      case 2:
        return solutions.filter((s) => s.text.trim() !== "").length >= 3;
      case 3:
        return (
          evaluations.length === solutions.length &&
          evaluations.every((e) => e.strengths && e.weaknesses)
        );
      case 4:
        return bestIndex !== null;
      case 5:
        return plan.trim() !== "";
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canGoNext()) setStep((prev) => prev + 1);
    else toast.error("لطفاً همه‌ی فیلدها را تکمیل کنید.");
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    toast.success("فرم با موفقیت ثبت شد.");

    const solutionsText = solutions.map((s) => s.text).join(", ");
    const evalText = evaluations
      .map(
        (e, i) =>
          `نقاط قوت راه‌حل ${i + 1}: ${e.strengths ?? ""} - نقاط ضعف: ${
            e.weaknesses ?? ""
          }`
      )
      .join(", ");

    try {
      await insertSocialProblem({
        date: new Date().toISOString().slice(0, 10),
        time: `${new Date().getHours()}:${new Date().getMinutes()}`,
        user_id: user?.id ?? 0,
        user_name: user?.name ?? "",
        problem: problem,
        reason: reason,
        solutions: solutionsText,
        evaluations: evalText,
        bestindex: bestIndex !== null ? solutions[bestIndex].text : "",
        plan: plan,
      });
      onSubmit();
    } catch (err) {
      console.error("DB error:", err);
      toast.error("خطا در ثبت اطلاعات");
    }
  };

  return (
    <div className="p-6 pb-24 overflow-y-auto bg-white w-full rounded-lg">
      <h2 className="text-right font-vazir-bold text-2xl mb-6">مرحله {step}</h2>

      {/* مرحله ۱ */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <label className="text-right font-vazir text-lg">مشکلتون چیه؟</label>
          <input
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="شرح مشکل"
            className="w-full border border-gray-300 rounded-lg font-vazir text-right px-3 py-2"
          />

          <label className="text-right font-vazir text-lg">
            چه چیزی باعث این فکر شده؟
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="دلیل فکر خودکشی"
            className="w-full border border-gray-300 rounded-lg font-vazir text-right px-3 py-2"
          />
        </div>
      )}

      {/* مرحله ۲ */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <label className="text-right font-vazir text-lg">
            چه راه‌حل‌هایی به ذهنت می‌رسه؟ (حداقل ۳ مورد)
          </label>

          {solutions.map((s, i) => (
            <input
              key={i}
              value={s.text}
              onChange={(e) => {
                const newSolutions = [...solutions];
                newSolutions[i].text = e.target.value;
                setSolutions(newSolutions);
              }}
              placeholder={`راه‌حل ${i + 1}`}
              className="w-full border border-gray-300 rounded-lg font-vazir text-right px-3 py-2"
            />
          ))}

          <button
            onClick={handleAddSolution}
            className="text-blue-600 font-vazir text-sm mt-2"
          >
            افزودن راه‌حل جدید
          </button>
        </div>
      )}

      {/* مرحله ۳ */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <p className="text-right font-vazir text-lg">
            نقاط قوت و ضعف هر راه‌حل:
          </p>
          {solutions.map((s, i) => (
            <div key={i} className="flex flex-col gap-3">
              <p className="text-right font-vazir-bold">
                <span className="text-[#5ba88a]">{i + 1} - </span>
                {s.text}
              </p>
              <input
                placeholder="نقاط قوت"
                value={evaluations[i]?.strengths || ""}
                onChange={(e) => {
                  const newEvals = [...evaluations];
                  newEvals[i] = {
                    ...(newEvals[i] || {}),
                    strengths: e.target.value,
                  };
                  setEvaluations(newEvals);
                }}
                className="w-full border border-gray-300 rounded-lg font-vazir text-right px-3 py-2"
              />
              <input
                placeholder="نقاط ضعف"
                value={evaluations[i]?.weaknesses || ""}
                onChange={(e) => {
                  const newEvals = [...evaluations];
                  newEvals[i] = {
                    ...(newEvals[i] || {}),
                    weaknesses: e.target.value,
                  };
                  setEvaluations(newEvals);
                }}
                className="w-full border border-gray-300 rounded-lg font-vazir text-right px-3 py-2"
              />
            </div>
          ))}
        </div>
      )}

      {/* مرحله ۴ */}
      {step === 4 && (
        <div className="flex flex-col gap-3">
          <p className="text-right font-vazir text-lg">
            کدام راه‌حل را بهترین می‌دانی؟
          </p>
          {solutions.map((s, i) => (
            <button
              key={i}
              onClick={() => setBestIndex(i)}
              className={`text-right font-vazir rounded-lg px-3 py-2 transition ${
                bestIndex === i
                  ? "bg-[#5ba88a] text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {s.text || `راه‌حل ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* مرحله ۵ */}
      {step === 5 && (
        <div className="flex flex-col gap-4">
          <p className="text-right font-vazir text-lg">
            چطور می‌خواهی این راه‌حل را اجرا کنی؟
          </p>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="برنامه اجرای راه‌حل"
            className="w-full border border-gray-300 rounded-lg font-vazir text-right px-3 py-2 min-h-[120px]"
          />
        </div>
      )}

      {/* دکمه‌های کنترل */}
      <div className="flex flex-row-reverse justify-between mt-8">
        {step > 1 && (
          <button
            onClick={handlePrev}
            className="font-vazir text-white px-4 py-2 rounded-lg bg-[#5ba88a]"
          >
            مرحله قبل
          </button>
        )}

        {step < 5 && (
          <button
            disabled={!canGoNext()}
            onClick={handleNext}
            className={`font-vazir text-white px-4 py-2 rounded-lg ${
              canGoNext() ? "bg-[#5ba88a]" : "bg-[#b0c5be] cursor-not-allowed"
            }`}
          >
            مرحله بعد
          </button>
        )}

        {step === 5 && (
          <button
            disabled={!canGoNext()}
            onClick={handleSubmit}
            className={`font-vazir text-white px-4 py-2 rounded-lg ${
              canGoNext() ? "bg-[#5ba88a]" : "bg-[#b0c5be] cursor-not-allowed"
            }`}
          >
            پایان
          </button>
        )}
      </div>
    </div>
  );
};

export default StepForm;
