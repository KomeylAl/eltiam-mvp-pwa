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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 max-w-md text-center space-y-5">
        <p className="text-lg font-vazir">
          تو تنها نیستی؛ افرادی هستند که به تو اهمیت می‌دهند و می‌خواهند کمکت
          کنند. اگر نیاز به صحبت داری، همین حالا تماس بگیر:
        </p>

        <div className="space-y-3">
          <button
            onClick={() => callPhoneNumber("123")}
            className="w-full p-4 bg-blue-500 hover:bg-blue-600 text-white text-lg rounded-lg font-vazir transition"
          >
            123
          </button>

          <button
            onClick={() => callPhoneNumber("1480")}
            className="w-full p-4 bg-blue-500 hover:bg-blue-600 text-white text-lg rounded-lg font-vazir transition"
          >
            1480
          </button>

          <button
            onClick={onClose}
            className="w-full p-3 bg-amber-500 hover:bg-amber-600 text-white text-lg rounded-lg font-vazir mt-3 transition"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
