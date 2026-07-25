export type RegisterDevicePayload = {
  token: string;
  platform: "pwa";
  external_user_id: string;
  device_name?: string;
};

export type RegisterDeviceResponse = {
  message?: string;
  data?: unknown;
};

export async function registerDevice(payload: {
  token: string;
  externalUserId: string | number;
  deviceName?: string;
}): Promise<RegisterDeviceResponse> {
  const body: RegisterDevicePayload = {
    token: payload.token,
    platform: "pwa",
    external_user_id: String(payload.externalUserId),
    device_name: payload.deviceName,
  };

  const res = await fetch("/api/push/register-device", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
