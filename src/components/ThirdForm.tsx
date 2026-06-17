"use client";

import React, { useEffect, useState } from "react";
import { getUserSetupData, UserSetupData } from "@/contexts/FormContext";
import { useUser } from "@/contexts/UserContext";
import { insertSafetyPlan } from "@/lib/dbActions";

interface ThirdFormProps {
  onSuccess: () => void;
}

const ThirdForm: React.FC<ThirdFormProps> = ({ onSuccess }) => {
  const { user } = useUser();

  const [isSelected, setSelection] = useState(false);
  const [isSecondSelected, setSecondSelection] = useState(false);
  const [data, setData] = useState<UserSetupData | null>(null);

  const [thinkingFeelings, setThinkingFeelings] = useState("");
  const [selfHelp, setSelfHelp] = useState("");
  const [othersHelp, setOthersHelp] = useState("");
  const [closePeopleList, setClosePeopleList] = useState("");
  const [friendThoughts, setFriendThoughts] = useState("");
  const [phoneCalls, setPhoneCalls] = useState("");
  const [protectedPlaces, setProtectedPlaces] = useState("");

  useEffect(() => {
    const getData = async () => {
      const data = await getUserSetupData();
      setData(data);
      setThinkingFeelings(data?.thinking_feelings ?? "");
      setSelfHelp(data?.self_help ?? "");
      setOthersHelp(data?.others_help ?? "");
      setClosePeopleList(data?.close_people_list ?? "");
      setFriendThoughts(data?.close_friends_thoughts ?? "");
      setPhoneCalls(data?.phone_calls ?? "");
      setProtectedPlaces(data?.protected_places ?? "");
    };
    getData();
  }, []);

  const onSubmit = async () => {
    try {
      await insertSafetyPlan({
        date: new Date().toISOString().slice(0, 10),
        time: `${new Date().getHours()}:${new Date().getMinutes()}`,
        user_id: user?.id ?? 0,
        user_name: user?.name ?? "",
        question_one: isSelected ? 1 : 0,
        question_tow: isSecondSelected ? 1 : 0,
        thinking_feelings: thinkingFeelings,
        self_help: selfHelp,
        others_help: othersHelp,
        close_people_list: closePeopleList,
        close_friends_thoughts: friendThoughts,
        phone_calls: phoneCalls,
        protected_places: protectedPlaces,
      });
      onSuccess();
    } catch (e) {
      console.error("Error:", e);
    }
  };

  const disabled =
    !thinkingFeelings ||
    !selfHelp ||
    !othersHelp ||
    !closePeopleList ||
    !friendThoughts ||
    !phoneCalls ||
    !protectedPlaces;

  return (
    <div className="w-full bg-white rounded-lg p-6 max-h-[80vh] overflow-y-auto text-right font-vazir">
      <h2 className="font-vazir-bold text-xl mb-4">برنامه ایمنی خودکشی</h2>

      {/* Checkbox 1 */}
      <label className="flex items-start gap-2 mt-4 cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => setSelection(!isSelected)}
          className="mt-1 accent-[#469173]"
        />
        <span className="font-vazir text-right">
          مطمئنم که همه لوازم خطرناک از من دور هستند
        </span>
      </label>

      {/* Checkbox 2 */}
      <label className="flex items-start gap-2 mt-4 cursor-pointer">
        <input
          type="checkbox"
          checked={isSecondSelected}
          onChange={() => setSecondSelection(!isSecondSelected)}
          className="mt-1 accent-[#469173]"
        />
        <span className="font-vazir text-right">
          بعد از اتمام این بحران، باید به روانشناس یا مشاور مراجعه کنم
        </span>
      </label>

      <p className="text-right font-vazir mt-6 text-base">
        پاسخ‌های پیشین شما به دیگر سوالات این فرم:
        <br />
        (در صورت تمایل می‌تونین پاسخ‌ها رو تغییر بدین و در نهایت ثبت کنین)
      </p>

      {/* Text Areas */}
      <FormTextArea
        label="چه حسی داره وقتی افکار خودکشی هجوم میارن؟ علائم هشدار دهنده (مثلا افکار، تصاویر، هیجانات، خلق و یا رفتارها) رو با استفاده از کلمات خودتون فهرست کنین."
        value={thinkingFeelings}
        onChange={setThinkingFeelings}
      />

      <FormTextArea
        label="خودتون به تنهایی چه کارهایی می‌تونین انجام بدین تا این افکار رو کاهش بدین؟ چه چیزی می‌تونه مانع استفاده شما از ابزار خودکشی بشه؟"
        value={selfHelp}
        onChange={setSelfHelp}
      />

      <FormTextArea
        label="چه کسی بهتون کمک می‌کنه تا حواستون از افکار و مشکلات پرت بشه؟ یا چه کسی هست که وقتی باهاش مشورت می‌کنین حس بهتری پیدا می‌کنین؟"
        value={othersHelp}
        onChange={setOthersHelp}
      />

      <FormTextArea
        label="لیستی از افراد معتمد دور و نزدیک خودتون رو فهرست کنین که به شما گوش میدن و میتونن کنارتون مونده و شمارو حمایت کنن."
        value={closePeopleList}
        onChange={setClosePeopleList}
      />

      <FormTextArea
        label="اگه یکی از دوستای صمیمی‌تون فکر خودکشی داشته باشه، چی بهش می‌گین؟"
        value={friendThoughts}
        onChange={setFriendThoughts}
      />

      <FormTextArea
        label="به چه کسایی می‌تونین زنگ بزنین؟ (حتما شماره‌ها رو هم بنویسین)"
        value={phoneCalls}
        onChange={setPhoneCalls}
      />

      <FormTextArea
        label="لطفا مکان‌های امنی که می‌تونین برین رو یادداشت کنین."
        value={protectedPlaces}
        onChange={setProtectedPlaces}
      />

      <button
        onClick={onSubmit}
        disabled={disabled}
        className={`w-full mt-6 border border-[#469173] rounded-lg py-3 text-lg font-vazir transition-colors ${
          disabled
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-[#469173] hover:bg-[#469173] hover:text-white"
        }`}
      >
        ثبت اطلاعات
      </button>
    </div>
  );
};

export default ThirdForm;

interface FormTextAreaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  value,
  onChange,
}) => (
  <div className="mt-6">
    <p className="text-right font-vazir mb-2">{label}</p>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg p-3 text-right font-vazir resize-none focus:ring-2 focus:ring-[#469173] outline-none"
      rows={5}
    />
  </div>
);
