"use client";

import { Modal } from "@/components/Modal";
import ReminderSettings from "@/components/ReminderSettings";
import SecureForm from "@/components/SecureForm";
import { useModal } from "@/hooks/useModal";
import { useSyncWithServer } from "@/lib/dbActions";
import React from "react";

const Settings = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const { sync, forceResync, isLoading } = useSyncWithServer();

  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-fade-in">
      <div className="page-header flex flex-col items-center justify-center gap-2 py-10 px-4">
        <span className="text-3xl">⚙️</span>
        <p className="text-2xl text-white font-vazir-bold">تنظیمات</p>
        <p className="text-sm text-white/80 font-vazir text-center">
          مدیریت فرم‌ها و همگام‌سازی اطلاعات
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 px-5 -mt-4">
        <ReminderSettings />

        <button className="settings-card p-5 flex items-center gap-4" onClick={openModal}>
          <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
            <span className="text-xl">📝</span>
          </div>
          <div className="text-right flex-1">
            <p className="text-primary font-vazir-bold text-base">
              ویرایش فرم اولیه
            </p>
            <p className="text-gray-400 text-xs font-vazir mt-0.5">
              برنامه ایمنی و اطلاعات پایه
            </p>
          </div>
          <span className="text-gray-300 text-lg">‹</span>
        </button>

        <button
          className="settings-card p-5 flex items-center gap-4"
          onClick={() => sync()}
          disabled={isLoading}
        >
          <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
            <span className="text-xl">{isLoading ? "⏳" : "🔄"}</span>
          </div>
          <div className="text-right flex-1">
            <p className="text-primary font-vazir-bold text-base">
              {isLoading ? "در حال همگام‌سازی..." : "همگام‌سازی با سرور"}
            </p>
            <p className="text-gray-400 text-xs font-vazir mt-0.5">
              ارسال اطلاعات ذخیره‌شده آفلاین
            </p>
          </div>
          <span className="text-gray-300 text-lg">‹</span>
        </button>

        <button
          className="settings-card p-5 flex items-center gap-4"
          onClick={() => forceResync()}
          disabled={isLoading}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <span className="text-xl">⚠️</span>
          </div>
          <div className="text-right flex-1">
            <p className="text-amber-700 font-vazir-bold text-base">
              ارسال مجدد همه اطلاعات
            </p>
            <p className="text-gray-400 text-xs font-vazir mt-0.5">
              در صورت ناقص بودن داده‌ها در پنل
            </p>
          </div>
          <span className="text-gray-300 text-lg">‹</span>
        </button>

        <div className="mt-4 p-4 rounded-xl bg-primary-soft border border-primary/10">
          <p className="text-primary-dark text-xs font-vazir leading-relaxed text-center">
            اطلاعات ابتدا آفلاین ذخیره می‌شوند و با اتصال اینترنت به‌صورت
            خودکار همگام‌سازی می‌گردند. در صورت نیاز می‌توانید دستی هم سینک
            کنید.
          </p>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className="flex justify-center items-center bg-black/50 p-4 fixed inset-0 z-50">
          <SecureForm onSubmit={closeModal} />
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
