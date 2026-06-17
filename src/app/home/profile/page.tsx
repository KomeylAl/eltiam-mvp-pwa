"use client";

import React from "react";
import { useUser } from "@/contexts/UserContext";
import { convertDate } from "@/utils/converts";

const Profile: React.FC = () => {
  const { user, logout, isLoading } = useUser();

  const handleLogout = () => {
    logout();
  };

  const registerDate = new Date(user?.created_at ?? Date.now());
  const jalaliDate = convertDate(registerDate);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="font-vazir text-gray-500">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-fade-in">
      <div className="page-header flex flex-col items-center justify-center py-10 px-4">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-3 border-2 border-white/40">
          <span className="text-3xl text-white font-vazir-bold">
            {user?.name?.charAt(0) ?? "؟"}
          </span>
        </div>
        <h1 className="text-xl text-white font-vazir-bold">
          {user?.name || "کاربر"}
        </h1>
        <p className="text-sm text-white/70 font-vazir mt-1" dir="ltr">
          {user?.phone || "—"}
        </p>
      </div>

      <div className="mx-5 -mt-4">
        <div className="settings-card p-5 flex flex-col gap-0">
          <InfoRow label="نام و نام خانوادگی" value={user?.name} />
          <Divider />
          <InfoRow label="شماره تلفن" value={user?.phone} dir="ltr" />
          <Divider />
          <InfoRow label="نقش" value="بیمار" />
          <Divider />
          <InfoRow label="تاریخ عضویت" value={jalaliDate} />
        </div>
      </div>

      <div className="p-5 mt-2">
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl border-2 border-rose-400 text-rose-500 font-vazir-bold text-base hover:bg-rose-500 hover:text-white transition-all"
        >
          خروج از حساب
        </button>
      </div>
    </div>
  );
};

const InfoRow = ({
  label,
  value,
  dir,
}: {
  label: string;
  value?: string;
  dir?: string;
}) => (
  <div className="flex flex-row items-center justify-between py-3">
    <p className="text-gray-500 font-vazir text-sm">{label}</p>
    <p
      className="text-primary font-vazir-bold text-sm"
      dir={dir}
    >
      {value || "—"}
    </p>
  </div>
);

const Divider = () => <div className="w-full h-px bg-gray-100" />;

export default Profile;
