const REGISTERED_DEVICE_KEY = "pulse_registered_device";
const PROMPT_DISMISSED_KEY = "push_notification_prompt_dismissed";

type RegisteredDevice = {
  userId: number;
  token: string;
};

export function getRegisteredDevice(): RegisteredDevice | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(REGISTERED_DEVICE_KEY);
    return raw ? (JSON.parse(raw) as RegisteredDevice) : null;
  } catch {
    return null;
  }
}

export function setRegisteredDevice(userId: number, token: string): void {
  const payload: RegisteredDevice = { userId, token };
  localStorage.setItem(REGISTERED_DEVICE_KEY, JSON.stringify(payload));
}

export function clearRegisteredDevice(): void {
  localStorage.removeItem(REGISTERED_DEVICE_KEY);
}

export function isPromptDismissed(): boolean {
  return localStorage.getItem(PROMPT_DISMISSED_KEY) === "true";
}

export function dismissPrompt(): void {
  localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
}

export function shouldSkipRegistration(userId: number, token: string): boolean {
  const registered = getRegisteredDevice();
  return registered?.userId === userId && registered?.token === token;
}
