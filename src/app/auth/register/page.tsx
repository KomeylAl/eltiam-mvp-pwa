import Link from "next/link";
import React from "react";

const Register = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="glass-card w-full max-w-sm rounded-2xl p-8 flex flex-col gap-4 text-center">
        <span className="text-4xl">🔒</span>
        <h2 className="text-white text-xl font-vazir-bold">ثبت‌نام غیرفعال</h2>
        <p className="text-white/70 text-sm font-vazir leading-relaxed">
          حساب کاربری بیماران توسط درمانگر ایجاد می‌شود. لطفاً با درمانگر خود
          تماس بگیرید تا شماره تلفن و رمز عبور دریافت کنید.
        </p>
        <Link
          href="/auth/login"
          className="w-full py-3.5 rounded-xl bg-white text-primary font-vazir-bold text-center mt-2 hover:shadow-lg transition-all"
        >
          بازگشت به ورود
        </Link>
      </div>
    </div>
  );
};

export default Register;
