export type RegisterDevicePayload = {
  fcm_token: string;
  platform: "web";
};

export type RegisterDeviceResponse = {
  message?: string;
  data?: unknown;
};

export async function registerDevice(
  fcmToken: string
): Promise<RegisterDeviceResponse> {
  const res = await fetch("/api/push/register-device", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fcm_token: fcmToken,
      platform: "web",
    } satisfies RegisterDevicePayload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (data as { message?: string }).message ||
        "ثبت دستگاه برای دریافت اعلان‌ها ناموفق بود."
    );
  }

  return data as RegisterDeviceResponse;
}
