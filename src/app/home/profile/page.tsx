"use client";

import React from "react";
import { useUser } from "@/contexts/UserContext";
import { convertDate } from "@/utils/converts";

const Profile: React.FC = () => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  const registerDate = new Date(user?.created_at ?? Date.now());
  const jalaliDate = convertDate(registerDate);

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Header */}
      <div className="w-full bg-[#469173] flex flex-col items-center justify-center py-12 h-48 text-center">
        <h1 className="text-3xl text-white font-bold">حساب کاربری</h1>
        <p className="text-xl text-white font-vazir mt-4">
          تنظیمات حساب کاربری
        </p>
      </div>

      {/* Profile Info */}
      <div className="mx-5 mt-5 rounded-lg border border-gray-300 p-6 flex flex-col items-start justify-center gap-6">
        <div className="w-full flex flex-row items-center justify-start gap-4">
          <p className="text-gray-900 text-right font-vazir-bold text-lg">
            نام و نام خانوادگی:
          </p>
          <p className="text-[#469173] text-right font-vazir-bold text-lg">
            {user?.name || "—"}
          </p>
        </div>

        <div className="w-full h-px bg-gray-300" />

        <div className="w-full flex flex-row items-center justify-start gap-4">
          <p className="text-gray-900 text-right font-vazir-bold text-lg">
            کد ملی:
          </p>
          <p className="text-[#469173] text-right font-vazir-bold text-lg">
            {user?.national_code || "—"}
          </p>
        </div>

        <div className="w-full h-px bg-gray-300" />

        <div className="w-full flex flex-row items-center justify-start gap-4">
          <p className="text-gray-900 text-right font-vazir-bold text-lg">
            شماره تلفن:
          </p>
          <p className="text-[#469173] text-right font-vazir-bold text-lg">
            {user?.phone || "—"}
          </p>
        </div>

        <div className="w-full h-px bg-gray-300" />

        <div className="w-full flex flex-row items-center justify-start gap-4">
          <p className="text-gray-900 text-right font-vazir-bold text-lg">
            تاریخ عضویت:
          </p>
          <p className="text-[#469173] font-vazir-bold text-lg text-left">
            {jalaliDate}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-5">
        <button
          className="w-full bg-white p-4 rounded-lg border border-[#469173] text-[#469173] font-vazir text-lg hover:bg-[#469173] hover:text-white transition"
          // onClick={() => ...}
        >
          ویرایش اطلاعات
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-white p-4 rounded-lg mt-5 border border-rose-500 text-rose-500 font-vazir text-lg hover:bg-rose-500 hover:text-white transition"
        >
          خروج
        </button>
      </div>
    </div>
  );
};

export default Profile;
