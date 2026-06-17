import React, { useEffect, useState } from "react";
import toast from "react-hot-toast"; // معادل Toast برای وب
import {
  getUserSetupData,
  isFirstTimeUser,
  markUserSetupComplete,
  saveUserSetupData,
} from "@/contexts/FormContext";

interface SecureFormProps {
  onSubmit: () => void;
}

const SecureForm: React.FC<SecureFormProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);

  const [thinkingFeelings, setThinkingFeelings] = useState("");
  const [selfHelp, setSelfHelp] = useState("");
  const [othersHelp, setOthersHelp] = useState("");
  const [closePeopleList, setClosePeopleList] = useState("");
  const [friendThoughts, setFriendThoughts] = useState("");
  const [phoneCalls, setPhoneCalls] = useState("");
  const [protectedPlaces, setProtectedPlaces] = useState("");

  useEffect(() => {
    const checkData = async () => {
      const value = await isFirstTimeUser();
      if (!value) {
        const data = await getUserSetupData();
        setThinkingFeelings(data?.thinking_feelings ?? "");
        setSelfHelp(data?.self_help ?? "");
        setOthersHelp(data?.others_help ?? "");
        setClosePeopleList(data?.close_people_list ?? "");
        setFriendThoughts(data?.close_friends_thoughts ?? "");
        setPhoneCalls(data?.phone_calls ?? "");
        setProtectedPlaces(data?.protected_places ?? "");
      }
    };
    checkData();
  }, []);

  const canGoNext = () => {
    switch (step) {
      case 1:
        return thinkingFeelings.trim();
      case 2:
        return selfHelp.trim();
      case 3:
        return othersHelp.trim();
      case 4:
        return closePeopleList.trim();
      case 5:
        return friendThoughts.trim();
      case 6:
        return phoneCalls.trim();
      case 7:
        return protectedPlaces.trim();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canGoNext()) setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const renderTextarea = (value: string, setter: (val: string) => void) => (
    <textarea
      value={value}
      onChange={(e) => setter(e.target.value)}
      className="w-full h-48 border border-gray-300 rounded-lg font-vazir text-right p-3 focus:outline-none focus:ring-2 focus:ring-[#5ba88a]"
      placeholder="اینجا بنویسید..."
    />
  );

  return (
    <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
      <h2 className="text-right font-vazir-bold text-2xl">مرحله {step}</h2>

      {step === 1 && (
        <>
          <p className="text-right font-vazir text-lg">
            چه حسی داره وقتی افکار خودکشی هجوم میارن؟ علائم هشدار دهنده (مثلا
            افکار، تصاویر، هیجانات، خلق و یا رفتارها) رو با استفاده از کلمات
            خودتون فهرست کنین.
          </p>
          {renderTextarea(thinkingFeelings, setThinkingFeelings)}
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-right font-vazir text-lg">
            خودتون به تنهایی چه کارهایی میتونین انجام بدین تا این افکار رو کاهش
            بدین؟ چه چیزی میتونه مانع استفاده شما از ابزار خودکشی بشه؟ از روش حل
            مسئله هم میتونین استفاده کنین.
          </p>
          {renderTextarea(selfHelp, setSelfHelp)}
        </>
      )}

      {step === 3 && (
        <>
          <p className="text-right font-vazir text-lg">
            چه کسی بهتون کمک میکنه تا حداقل برای مدت کوتاهی حواستون از افکار و
            مشکلات پرت بشه؟ یا با چه کسی وقتی مشورت میکنین حس بهتری پیدا میکنین؟
          </p>
          {renderTextarea(othersHelp, setOthersHelp)}
        </>
      )}

      {step === 4 && (
        <>
          <p className="text-right font-vazir text-lg">
            لیستی از افراد معتمد خودتون رو بنویسین که بهتون گوش میدن و کنارتون
            می‌مونن. در این مرحله باید بگین در خطر خودکشی هستین.
          </p>
          {renderTextarea(closePeopleList, setClosePeopleList)}
        </>
      )}

      {step === 5 && (
        <>
          <p className="text-right font-vazir text-lg">
            اگه یکی از دوستاتون فکر خودکشی داشته باشه چی بهش میگین؟ بقیه چه
            چیزهایی میتونن بگن که کمک کننده باشه؟
          </p>
          {renderTextarea(friendThoughts, setFriendThoughts)}
        </>
      )}

      {step === 6 && (
        <>
          <p className="text-right font-vazir text-lg">
            به چه کسایی میتونین زنگ بزنین؟ (حتما شماره‌ها رو هم بنویسین). برای
            مثال: اعضای خانواده، متخصصین، تلفن‌های مشاوره رایگان یا دوستان.
          </p>
          {renderTextarea(phoneCalls, setPhoneCalls)}
        </>
      )}

      {step === 7 && (
        <>
          <p className="text-right font-vazir text-lg">
            لطفا مکان‌های امنی که می‌تونین برین رو یادداشت کنین.
          </p>
          {renderTextarea(protectedPlaces, setProtectedPlaces)}
        </>
      )}

      <div className="flex flex-row-reverse justify-between mt-8">
        {step > 1 && (
          <button
            onClick={handlePrev}
            className="font-vazir text-white px-4 py-2 rounded-lg bg-[#5ba88a] hover:opacity-90 transition"
          >
            مرحله قبل
          </button>
        )}

        {step < 7 && (
          <button
            disabled={!canGoNext()}
            onClick={handleNext}
            className={`font-vazir text-white px-4 py-2 rounded-lg ${
              canGoNext() ? "bg-[#5ba88a]" : "bg-[#b0c5be] cursor-not-allowed"
            } transition`}
          >
            مرحله بعد
          </button>
        )}

        {step === 7 && (
          <button
            disabled={!canGoNext()}
            onClick={async () => {
              await saveUserSetupData({
                thinking_feelings: thinkingFeelings,
                self_help: selfHelp,
                others_help: othersHelp,
                close_people_list: closePeopleList,
                close_friends_thoughts: friendThoughts,
                phone_calls: phoneCalls,
                protected_places: protectedPlaces,
              });
              await markUserSetupComplete();
              toast.success("فرم ابتدایی با موفقیت ثبت شد 🌱");
              onSubmit();
            }}
            className={`font-vazir text-white px-4 py-2 rounded-lg ${
              canGoNext() ? "bg-[#5ba88a]" : "bg-[#b0c5be] cursor-not-allowed"
            } transition`}
          >
            پایان
          </button>
        )}
      </div>
    </div>
  );
};

export default SecureForm;
