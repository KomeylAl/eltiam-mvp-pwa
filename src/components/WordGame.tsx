"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Confetti from "react-confetti";
import "react-toastify/dist/ReactToastify.css";
import { insertWordGame } from "@/lib/dbActions";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";

interface Word {
  word: string;
  isPositive: boolean;
}

interface PositiveWordGameProps {
  onFinish: () => void;
}

const WORDS: Word[] = [
  { word: "ارزشمند", isPositive: true },
  { word: "قابل اعتماد", isPositive: true },
  { word: "اضافی", isPositive: false },
  { word: "سربار", isPositive: false },
  { word: "مفید", isPositive: true },
  { word: "قابل اتکا", isPositive: true },
  { word: "بی ارزش", isPositive: false },
  { word: "بی فایده", isPositive: false },
  { word: "کارآمد", isPositive: true },
  { word: "تاثیرگذار", isPositive: true },
  { word: "نخواستنی", isPositive: false },
  { word: "خواستنی", isPositive: true },
  { word: "دوست داشتنی", isPositive: true },
  { word: "دوست نداشتنی", isPositive: false },
  { word: "بی تاثیر", isPositive: false },
  { word: "بدردنخور", isPositive: false },
];

const POSITIVE_COUNT = WORDS.filter((w) => w.isPositive).length;
const TIME_LIMIT = 59;

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const PositiveWordGame: React.FC<PositiveWordGameProps> = ({ onFinish }) => {
  const { user } = useUser();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSavedRef = useRef(false);

  const shuffledWords = useMemo(() => shuffleArray(WORDS), []);

  // Timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameEnded) handleGameEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameEnded]);

  const handleSelectWord = (wordObj: Word) => {
    if (selectedWords.includes(wordObj.word) || gameEnded) return;

    if (wordObj.isPositive) {
      toast.success("آفرین! کلمه مثبت رو درست انتخاب کردی 🌟");
      const updated = [...selectedWords, wordObj.word];
      setSelectedWords(updated);
      setScore((prev) => prev + 10);

      if (updated.length === POSITIVE_COUNT) {
        setShowConfetti(true);
        toast.success("کارت عالی بود! 🎉 همه کلمات مثبت رو درست زدی!");
        if (intervalRef.current) clearInterval(intervalRef.current);
        setGameEnded(true);
      }
    } else {
      toast.error("این کلمه مثبت نیست 😅 دوباره تلاش کن!");
      setScore((prev) => prev - 5);
    }
  };

  const handleGameEnd = async () => {
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;

    const bonus = timeLeft;
    const finalScore = score + bonus;

    if (selectedWords.length < POSITIVE_COUNT) {
      toast.error("⏰ زمان تموم شد! همین که تلاش کردی عالیه 💪");
    }

    try {
      await insertWordGame({
        date: new Date().toISOString().slice(0, 10),
        time: `${new Date().getHours()}:${new Date().getMinutes()}`,
        user_id: user?.id ?? 0,
        user_name: user?.name ?? "",
        point: finalScore,
      });
    } catch (e) {
      console.error("Error:", e);
    }

    onFinish();
  };

  return (
    <div className="flex flex-col items-center text-right font-vazir w-full px-4">
      <h2 className="text-2xl font-vazir-bold mt-4">بازی با کلمات مثبت</h2>
      <p className="mt-2 text-lg">لطفا کلمات مثبت را انتخاب کنید 🌸</p>
      <p className="mt-1 text-gray-700 text-base">
        ⏳ زمان باقی‌مانده: <b>{timeLeft}</b> ثانیه
      </p>

      <div className="mt-6 flex flex-wrap justify-start gap-3 max-w-2xl">
        {shuffledWords.map((item, index) => (
          <button
            key={index}
            onClick={() => handleSelectWord(item)}
            className={`px-4 py-2 rounded-lg text-lg transition-all duration-300 border ${
              selectedWords.includes(item.word)
                ? "bg-green-600 text-white border-green-700"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {item.word}
          </button>
        ))}
      </div>

      {showConfetti && <Confetti numberOfPieces={150} recycle={false} />}

      <p className="mt-8 text-lg text-gray-800">
        🎯 امتیاز فعلی: <b>{score}</b>
      </p>
    </div>
  );
};

export default PositiveWordGame;
