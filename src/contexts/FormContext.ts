export const isFirstTimeUser = () => {
  const value = localStorage.getItem("user_setup_completed");
  return value !== "true"; // یعنی یا null یا falseه
};

export const markUserSetupComplete = () => {
  localStorage.setItem("user_setup_completed", "true");
};

export interface UserSetupData {
  thinking_feelings: string;
  self_help: string;
  others_help: string;
  close_people_list: string;
  close_friends_thoughts: string;
  phone_calls: string;
  protected_places: string;
}

const FORM_KEY = "user_setup_data";

export const saveUserSetupData = (data: UserSetupData) => {
  localStorage.setItem(FORM_KEY, JSON.stringify(data));
};

export const getUserSetupData = () => {
  const json = localStorage.getItem(FORM_KEY);
  return json ? JSON.parse(json) : null;
};
