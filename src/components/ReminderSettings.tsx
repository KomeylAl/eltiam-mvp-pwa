"use client";

import {
  disableFormReminders,
  enableFormReminders,
  getNotificationPermission,
  isRemindersEnabled,
} from "@/lib/notifications";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ReminderSettings() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setEnabled(isRemindersEnabled());
    setPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (enabled) {
        await disableFormReminders();
        setEnabled(false);
        toast.success("یادآور فرم‌ها غیرفعال شد.");
      } else {
        const ok = await enableFormReminders();
        if (ok) {
          setEnabled(true);
          setPermission("granted");
          toast.success("یادآور فرم‌ها فعال شد.");
        } else if (getNotificationPermission() === "denied") {
          toast.error(
            "دسترسی نوتیفیکیشن مسدود است. از تنظیمات مرورگر اجازه دهید."
          );
        } else {
          toast.error("اجازه نوتیفیکیشن داده نشد.");
        }
      }
    } finally {
      setLoading(false);
      refresh();
    }
  };

  const permissionLabel =
    permission === "unsupported"
      ? "پشتیبانی نمی‌شود"
      : permission === "granted"
        ? "فعال ✓"
        : permission === "denied"
          ? "مسدود شده"
          : "نیاز به اجازه";

  return (
    <div className="settings-card p-5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
          <span className="text-xl">🔔</span>
        </div>
        <div className="text-right flex-1">
          <p className="text-primary font-vazir-bold text-base">
            یادآور پر کردن فرم
          </p>
          <p className="text-gray-400 text-xs font-vazir mt-0.5">
            نوتیف در ساعات تعیین‌شده — {permissionLabel}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          disabled={loading || permission === "unsupported"}
          onClick={handleToggle}
          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
            enabled ? "bg-primary" : "bg-gray-300"
          } ${loading ? "opacity-60" : ""}`}
        >
          <span
          className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-200 ${
            enabled ? "left-0.5" : "left-[calc(100%-1.625rem)]"
          }`}
          />
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-gray-400 text-xs font-vazir leading-relaxed">
          در ابتدای هر بازه زمانی (۸، ۱۲، ۱۴، ۱۶ و ۱۷) یادآوری دریافت
          می‌کنید. اگر فرم را تکمیل کرده باشید، نوتیف ارسال نمی‌شود.
        </p>
        {permission === "denied" && (
          <p className="text-rose-500 text-xs font-vazir mt-2">
            برای فعال‌سازی، از تنظیمات مرورگر/گوشی اجازه نوتیفیکیشن بدهید.
          </p>
        )}
      </div>
    </div>
  );
}
