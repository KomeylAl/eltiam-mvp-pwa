"use client";

import { Modal } from "@/components/Modal";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    shouldShowPrompt,
    acceptPrompt,
    dismissPrompt,
    isRegistering,
  } = usePushNotifications();

  return (
    <>
      {children}

      <Modal
        isOpen={shouldShowPrompt}
        onClose={dismissPrompt}
        showCloseButton={false}
        className="max-w-sm mx-4"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔔</span>
          </div>

          <h2 className="text-lg font-vazir-bold text-gray-800 mb-2">
            دریافت اعلان‌ها
          </h2>

          <p className="text-sm text-gray-500 font-vazir leading-relaxed mb-6">
            برای اطلاع‌رسانی به‌موقع درباره پیام‌ها و رویدادهای مهم، اجازه
            ارسال اعلان را فعال کنید.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => void acceptPrompt()}
              disabled={isRegistering}
              className="w-full py-3 rounded-xl bg-primary text-white font-vazir-bold text-sm transition-opacity disabled:opacity-60"
            >
              {isRegistering ? "در حال فعال‌سازی..." : "فعال‌سازی اعلان‌ها"}
            </button>

            <button
              type="button"
              onClick={dismissPrompt}
              disabled={isRegistering}
              className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-vazir text-sm transition-colors hover:bg-gray-200 disabled:opacity-60"
            >
              بعداً
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
