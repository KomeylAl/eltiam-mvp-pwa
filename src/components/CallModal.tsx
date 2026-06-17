"use client";

import React from "react";

interface CallModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const CallModal: React.FC<CallModalProps> = ({ isVisible, onClose }) => {
  const callPhoneNumber = (phone: string) => {
    if (typeof window !== "undefined") {
      window.open(`tel:${phone}`);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-center space-y-5 animate-fade-in">
        <span className="text-4xl block">💚</span>
        <p className="text-base font-vazir text-gray-700 leading-relaxed">
          تو تنها نیستی؛ افرادی هستند که به تو اهمیت می‌دهند و می‌خواهند کمکت
          کنند. اگر نیاز به صحبت داری، همین حالا تماس بگیر:
        </p>

        <div className="space-y-3">
          <button
            onClick={() => callPhoneNumber("123")}
            className="w-full p-4 btn-primary text-lg font-vazir-bold"
          >
            📞 123
          </button>

          <button
            onClick={() => callPhoneNumber("1480")}
            className="w-full p-4 btn-primary text-lg font-vazir-bold"
          >
            📞 1480
          </button>

          <button
            onClick={onClose}
            className="w-full p-3 text-gray-500 font-vazir text-base mt-1"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
